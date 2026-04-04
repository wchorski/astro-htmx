// src/db/seed.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { Client } from "pg";

import * as schema from "./schema.js";
import { seedData } from "./seed-data.js";

// ---- guards -------------------------------------------------

const isProd = process.env.NODE_ENV === "production";
const allowSeed =
  process.argv.includes("--seed") || process.env.SEED_DB === "true";

if (!allowSeed) {
  console.log("ℹ️ Seeding skipped (no --seed flag)");
  process.exit(0);
}

if (isProd && process.env.ALLOW_PROD_SEED !== "true") {
  throw new Error(
    "❌ Refusing to seed production without ALLOW_PROD_SEED=true",
  );
}

// ---- connect ------------------------------------------------
const { DB_USER, DB_PASSWORD, DB_COLLECTION, DB_PROTOCOL, DB_DOMAIN, DB_PORT } =
  process.env;

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

const DATABASE_URL = `${DB_PROTOCOL}://${DB_USER}:${DB_PASSWORD}@${DB_DOMAIN}:${DB_PORT}/${DB_COLLECTION}`;

console.log({ DATABASE_URL });

const client = new Client({ connectionString: DATABASE_URL });

await client.connect();

const db = drizzle(client, { schema });

// ---- optional: truncate (VERY explicit) --------------------

if (process.argv.includes("--truncate")) {
  console.log("⚠️ Truncating tables...");
  await db.delete(schema.Credit);
  await db.delete(schema.Course);
  await db.delete(schema.User);
  await db.delete(schema.Location);
  await db.delete(schema.Role);
}

// ---- seed ---------------------------------------------------

//? generator mode for fake / randomized data

// await seed(db, schema, {
//   Role: {
//     count: 10,
//     columns: {
//       label: generators.text(),
//     },
//   },
// });
// await seed(db, schema).refine(
//   () =>
//     ({
//       roles: seedData.roles,
//       locations: seedData.locations,
//       users: seedData.users,
//       courses: seedData.courses,
//       credits: seedData.credits,
//     }) as any,
// );

console.log(`=== Roles (${seedData.roles.length})===`);
await db.insert(schema.Location).values(seedData.locations);
await db.insert(schema.Role).values(seedData.roles);
seedData.roles.forEach(element => {
  console.log(`+ ${element.label}`);
});
console.log('');
console.log(`=== Users (${seedData.users.length}) ===`);
await db.insert(schema.User).values(seedData.users);
seedData.users.forEach(element => {
  console.log(`+ ${element.email}`);
});
console.log('');
console.log(`=== Courses (${seedData.courses.length})===`);
await db.insert(schema.Course).values(seedData.courses);
seedData.courses.forEach(element => {
  console.log(`+ ${element.subject} | ${element.date_civil}`);
});
console.log('');

console.log(`=== Credits (${seedData.credits.length})===`);
await db.insert(schema.Credit).values(seedData.credits);
seedData.credits.forEach(element => {
  console.log(`+ course_id: ${element.course_id}, user_id: ${element.user_id}, attended: ${element.attended}`);
});
console.log('');

await client.end();

console.log("✅ Database seeded successfully");
