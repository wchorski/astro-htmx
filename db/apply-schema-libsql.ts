import fs from "node:fs";
import { createClient } from "@libsql/client";

const url = process.env.LIBSQL_URL;
if (!url) {
  throw new Error("Missing LIBSQL_URL");
}

const authToken = process.env.LIBSQL_AUTH_TOKEN;
const client = createClient({ url, ...(authToken ? { authToken } : {}) });

function splitSql(sql: string): string[] {
  // Minimal, practical splitter for schema files:
  // - removes line comments starting with --
  // - splits on semicolons
  // - trims and removes empty statements
  //
  // NOTE: This assumes your schema doesn't contain semicolons inside strings.
  const noComments = sql
    .split("\n")
    .map((line) => line.replace(/--.*$/g, ""))
    .join("\n");

  return noComments
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const schema = fs.readFileSync("db/schema.sql", "utf8");
  const statements = splitSql(schema);

  // Run all statements in a single write transaction
  // batch() is specifically meant for multiple statements and is atomic. [1](https://link.gcs.office.com//v1.0/sourceAlias/resolveItem/CoABNzMxMUMzNDgzRjU0MTYzMUVERjRFMkZCNzhDQ0Y2NEQ1RjM0ODQ2RDVGQTYyNUU4NTRBQ0ZCNUJCN0M2RjM2MEE4QjdBQkJBMTU2RDFBRDhENDVGNDlGMjM0REZFNjlDNEI1QUM4MDg4M0VERDg3M0Q1MzI5NUY3MDkzQkU3M0ISJGM5M2E3NjQ0LWZmMWUtNGI2OS1iNGExLWQzNjdhMjVjNDM4YhoXRmlsZUNvbm5lY3RvcjI2MDExNTE5NDE%3d)
  await client.batch(statements, "write");

  console.log("✅ Schema applied");
}

main()
  .then(() => client.close?.())
  .catch((err) => {
    console.error("❌ Schema apply failed:", err);
    process.exit(1);
  });
``