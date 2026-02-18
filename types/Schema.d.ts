import type { Course, Credit, Member } from "astro:db";
export type CreditInsert = typeof Credit.$inferInsert;
export type MemberInsert = typeof Member.$inferInsert;
export type CourseInsert = typeof Course.$inferInsert;

export type MemberCredit = {
  id: number;
  memberId: number;
  first_name: string;
  last_name: string;
  middle_initial: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  zip: number;
  attended: boolean;
};
