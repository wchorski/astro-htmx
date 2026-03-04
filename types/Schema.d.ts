import type { Course, Credit, User, Location, Role } from "astro:db";
export type RoleInsert = typeof Role.$inferInsert;
export type RoleSelect = typeof Role.$inferSelect;
export type CreditInsert = typeof Credit.$inferInsert;
export type CreditSelect = typeof Credit.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
export type UserSelect = typeof User.$inferSelect;
export type CourseInsert = typeof Course.$inferInsert;
export type CourseSelect = typeof Course.$inferSelect;
export type LocationInsert = typeof Location.$inferInsert;
export type LocationSelect = typeof Location.$inferSelect;
export type UserCreditSelect = {
  credit: CreditSelect,
  user: UserSelect,
}

export type UserCredit = {
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
