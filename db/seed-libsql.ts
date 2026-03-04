import { createClient } from "@libsql/client";
import { seedData } from "./seed-data.ts"; // adjust path

// const { LIBSQL_URL } = import.meta.env;

const client = createClient({ url: process.env.LIBSQL_URL! });

/** Quote identifiers safely for SQLite */
function qIdent(name: string) {
  // double quotes inside identifiers are escaped by doubling them
  return `"${name.replace(/"/g, '""')}"`;
}

/** Normalize JS values into SQLite-friendly values */
function normalizeValue(v: any) {
  if (v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "boolean") return v ? 1 : 0;
  return v;
}

/**
 * Upsert rows into a table using Object.keys(row).
 * Assumes each row has a stable primary key field `id`.
 */
async function upsertRows(table: string, rows: Array<Record<string, any>>) {
  if (!rows?.length) return;

  // Build per-row statements and run as one transaction batch (fast + atomic)
  const stmts = rows.map((row) => {
    const keys = Object.keys(row);

    // columns list and placeholders
    const cols = keys.map(qIdent).join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const args = keys.map((k) => normalizeValue(row[k]));

    // update list excluding id
    const updateKeys = keys.filter((k) => k !== "id");
    const updateClause =
      updateKeys.length === 0
        ? "" // no-op if only id exists
        : updateKeys
            .map((k) => `${qIdent(k)} = excluded.${qIdent(k)}`)
            .join(", ");

    const sql = `
      INSERT INTO ${qIdent(table)} (${cols})
      VALUES (${placeholders})
      ON CONFLICT(${qIdent("id")}) DO UPDATE SET
      ${updateClause};
    `;

    return { sql, args };
  });

  // Wrap in a write transaction batch:
  // batch executes statements in an implicit transaction; all or nothing. [3](https://tursodatabase.github.io/libsql-client-ts/interfaces/Client.html)
  await client.batch(stmts, "write");
}

async function main() {
  await client.execute("PRAGMA foreign_keys = ON;");

  // Insert in dependency order:
  await upsertRows("Location", seedData.locations);
  await upsertRows("Course", seedData.courses);
  await upsertRows("User", seedData.users);
  await upsertRows("Credit", seedData.credits);

  console.log("✅ Seed complete");
}

main()
  .then(() => client.close?.())
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
