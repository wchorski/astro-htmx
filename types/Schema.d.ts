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
  credit: CreditSelect;
  user: UserSelect;
};

export type UserCreditFlat = {
  userId: number;
  id: number;
  date: Date;
  courseId: number;
  grade: string | null;
  attended: boolean;
  roleId: number | null;
  first_name: string;
  last_name: string;
  middle_initial: string | null;
  phone: string;
  email: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: number;
};
