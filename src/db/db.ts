// src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const {
  DB_USER,
  DB_PASSWORD,
  DB_COLLECTION,
  DB_PROTOCOL,
  DB_DOMAIN,
  DB_PORT,
} = import.meta.env;

if (!DB_USER || !DB_PASSWORD || !DB_COLLECTION || !DB_PROTOCOL || !DB_DOMAIN || !DB_PORT) {
  throw new Error("Missing DB env vars");
}

const DATABASE_URL =
  `${DB_PROTOCOL}://${DB_USER}:${DB_PASSWORD}@${DB_DOMAIN}:${DB_PORT}/${DB_COLLECTION}`;

if (!DATABASE_URL) throw new Error("missing database env variable");


export const db = drizzle(DATABASE_URL, { schema });

console.log(Object.keys(db.query));
