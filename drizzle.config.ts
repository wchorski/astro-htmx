// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

const { DB_COLLECTION, DB_PASSWORD, DB_PORT, DB_PROTOCOL, DB_USER, DB_DOMAIN } =
  process.env;

if (
  !DB_COLLECTION ||
  !DB_PASSWORD ||
  !DB_PORT ||
  !DB_PROTOCOL ||
  !DB_USER ||
  !DB_DOMAIN
)
  throw new Error("missing database env variable");

export function getDbUrl() {
  const dbUrl =
    process.env.NODE_ENV === "production"
      ? `${DB_PROTOCOL}://${DB_USER}:${DB_PASSWORD}@${DB_DOMAIN}:${DB_PORT}/${DB_COLLECTION}`
      : process.env.DB_DEV_URL;

  if (!dbUrl) throw new Error("No database url found");

  return dbUrl;
}

const DATABASE_URL = getDbUrl();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
  },
});
