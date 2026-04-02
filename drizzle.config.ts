// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

const {
  DB_COLLECTION,
  DB_PASSWORD,
  DB_PORT,
  DB_PROTOCOL,
  DB_USER,
  DB_DOMAIN,
} = process.env;


if (
  !DB_COLLECTION ||
  !DB_PASSWORD ||
  !DB_PORT ||
  !DB_PROTOCOL ||
  !DB_USER ||
  !DB_DOMAIN
)
  throw new Error("missing database env variable");

const DATABASE_URL = `${DB_PROTOCOL!}://${DB_USER}:${DB_PASSWORD}@${DB_DOMAIN}:${DB_PORT}/${DB_COLLECTION}`;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
