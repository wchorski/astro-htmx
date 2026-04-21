// src/lib/schema.ts
import {
  pgTable,
  integer,
  text,
  boolean,
  date,
  uniqueIndex,
  index,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const Role = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  label: text().notNull().unique(),
  description: text(),
  permissions: text().array().notNull().default([]),
});

export const Location = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    name: text().notNull().unique(),
    address: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    zip: text().notNull(),
    timezone: text().notNull(),
    description: text(),
  },
  (table) => [
    index("locations_city_idx").on(table.city),
    index("locations_state_idx").on(table.state),
  ],
);

export const User = pgTable(
  "users",
  {
    // TODO switch to uuid when this app gets more serious and need more privacy with url
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    // id: integer().primaryKey().generatedByDefaultAsIdentity(),
    role_id: uuid().references(() => Role.id),
    first_name: text().notNull(),
    last_name: text().notNull(),
    middle_initial: text(),
    phone: text().notNull().unique(),
    email: text().notNull().unique(),
    address_1: text().notNull(),
    address_2: text(),
    city: text().notNull(),
    state: text().notNull(),
    zip: text().notNull(),
  },
  (table) => [index("users_role_id_idx").on(table.role_id)],
);

export const Course = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    wp_post_id: integer().unique(),
    subject: text().notNull(),
    description: text(),
    where: text(),
    timestamp: timestamp().notNull(),
    date_civil: text().notNull(),
    location_id: uuid()
      .notNull()
      .references(() => Location.id),
  },
  (table) => [
    index("courses_location_id_idx").on(table.location_id),
    uniqueIndex("courses_subject_date_location_unique").on(
      table.subject,
      table.date_civil,
      table.location_id,
    ),
  ],
);

export const Credit = pgTable(
  "credits",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    user_id: uuid("user_id")
      .notNull()
      .references(() => User.id),
    // user_id: integer("user_id")
    //   .notNull()
    //   .references(() => User.id),
    course_id: uuid("course_id")
      .notNull()
      .references(() => Course.id),
    timestamp: timestamp().notNull(),
    grade: text(),
    attended: boolean().notNull().default(false),
  },
  (table) => [
    index("credits_user_id_idx").on(table.user_id),
    index("credits_course_id_idx").on(table.course_id),
    uniqueIndex("credits_course_user_unique").on(
      table.course_id,
      table.user_id,
    ),
  ],
);
