// src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { createPgClient, getPGDatabaseUrl } from "./client";

console.log("db.ts DATABASE_URL: ", getPGDatabaseUrl());

const client = createPgClient();
await client.connect();


export const db = drizzle(client, {
  schema,
  // ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
  // logger: import.meta.env.DEV
  // logger: true
});
