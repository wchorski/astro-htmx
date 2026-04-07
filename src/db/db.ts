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
  DB_DEV_URL,
} = import.meta.env;

if (
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_COLLECTION ||
  !DB_PROTOCOL ||
  !DB_DOMAIN ||
  !DB_PORT
) {
  throw new Error("Missing DB env vars");
}

export function getDbUrl() {
  console.log("NODE_ENV: ", process.env.NODE_ENV);
  if (!DB_PASSWORD) throw new Error("db password not set");
  const encodedPassword = encodeURIComponent(DB_PASSWORD);
  const dbUrl =
    process.env.NODE_ENV === "production"
      ? `${DB_PROTOCOL}://${DB_USER}:${encodedPassword}@${DB_DOMAIN}:${DB_PORT}/${DB_COLLECTION}`
      : DB_DEV_URL;

  console.log("db.ts DATABASE_URL: ", dbUrl);

  if (!dbUrl) throw new Error("No database url found");

  return dbUrl;
}

const DATABASE_URL = getDbUrl();

export const db = drizzle(DATABASE_URL, {
  schema,
  // ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
});
