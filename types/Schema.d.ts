import type { Course, Credit, Member, Location } from "astro:db";
export type CreditInsert = typeof Credit.$inferInsert;
export type CreditSelect = typeof Credit.$inferSelect;
export type MemberInsert = typeof Member.$inferInsert;
export type MemberSelect = typeof Member.$inferSelect;
export type CourseInsert = typeof Course.$inferInsert;
export type CourseSelect = typeof Course.$inferSelect;
export type LocationInsert = typeof Location.$inferInsert;
export type LocationSelect = typeof Location.$inferSelect;
export type MemberCreditSelect = {
  credit: CreditSelect,
  member: MemberSelect,
}

export type MemberCredit = {
  id: number;
  userId: number;
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
