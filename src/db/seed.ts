// src/db/seed.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
//? only use if wanting random generated data
// import { seed } from "drizzle-seed";
import { Client } from "pg";

import * as schema from "./schema.js";
import { seedData } from "./seed-data.js";
import { createPgClient, getPGDatabaseUrl } from "./client.js";

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

console.log("seed.ts DATABASE_URL: ", getPGDatabaseUrl());

const client = createPgClient(); // pg auto-reads PG* env vars
await client.connect();

const db = drizzle(client, {
  schema,
  // logger: true
});

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
// seedData.roles.forEach((element) => {
//   console.log(`+ ${element.label}`);
// });
console.log("");
console.log(`=== Users (${seedData.users.length}) ===`);
await db.insert(schema.User).values(seedData.users);
// seedData.users.forEach((element) => {
//   console.log(`+ ${element.email}`);
// });
console.log("");
console.log(`=== Courses (${seedData.courses.length})===`);
await db.insert(schema.Course).values(seedData.courses);
// seedData.courses.forEach((element) => {
//   console.log(`+ ${element.subject} | ${element.date_civil}`);
// });
console.log("");

console.log(`=== Credits (${seedData.credits.length})===`);
await db.insert(schema.Credit).values(seedData.credits);
// seedData.credits.forEach((element) => {
//   console.log(
//     `+ course_id: ${element.course_id}, user_id: ${element.user_id}, attended: ${element.attended}`,
//   );
// });
console.log("");

await client.end();

console.log(
  `✅ Database seeded successfully. ${seedData.roles.length + seedData.users.length + seedData.courses.length + seedData.credits.length} items added`,
);
