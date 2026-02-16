import type { Course, Credit,Member } from "astro:db";
export type CreditInsert = typeof Credit.$inferInsert;
export type MemberInsert = typeof Member.$inferInsert;
export type CourseInsert = typeof Course.$inferInsert;