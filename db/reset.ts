// db/reset.ts — run once to clear out the old tables
import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.LIBSQL_URL! });

await client.batch([
  // drop in reverse dependency order to avoid FK violations
  { sql: `DROP TABLE IF EXISTS "Credit"`, args: [] },
  { sql: `DROP TABLE IF EXISTS "User"`, args: [] },
  { sql: `DROP TABLE IF EXISTS "Course"`, args: [] },
  { sql: `DROP TABLE IF EXISTS "Location"`, args: [] },
  { sql: `DROP TABLE IF EXISTS "Role"`, args: [] },
  // Astro DB internal tracking table — drop this too so it starts fresh
  { sql: `DROP TABLE IF EXISTS "__drizzle_migrations"`, args: [] },
], "write");

console.log("✅ All tables dropped");
await client.close();