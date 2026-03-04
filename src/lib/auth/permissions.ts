// @lib/permissions.ts
import { and, db, eq, User, Role } from "astro:db";
import type { Session } from "./session";
import type { BaseRow } from "@ty/FieldConfig";

export const PERMISSIONS = {
  manageAllMembers: "manageAllMembers",
  viewAllMembers: "viewAllMembers",
  manageAllCourses: "manageAllCourses",
  viewAllCourses: "viewAllCourses",
  manageAllCredits: "manageAllCredits",
  viewAllCredits: "viewAllCredits",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// TODO auth

export async function userCan(
  userId: number,
  permission: Permission,
): Promise<boolean> {
  const result = await db
    .select({ permissions: Role.permissions })
    .from(User)
    .innerJoin(Role, eq(Role.id, User.roleId))
    .where(eq(User.id, userId))
    .get();

  const permissions = result?.permissions as Permission[] | null;
  if (!Array.isArray(permissions)) return false; // guard against malformed json

  return permissions.includes(permission);
}

export const WRITABLE_FIELDS = {
  memberSelf: [
    "first_name",
    "last_name",
    "email",
    "phone",
    "address1",
    "address2",
    "city",
    "state",
    "zip",
  ],
  memberFull: [
    "first_name",
    "last_name",
    "email",
    "phone",
    "address1",
    "address2",
    "city",
    "state",
    "zip",
    "attended",
    "courseId",
  ], // admin can touch credits fields
} as const;

export type WritableScope = keyof typeof WRITABLE_FIELDS;

export const userPolicy = {
  read: async (session: Session, row: BaseRow) =>
    session.userId === row.id ||
    (await userCan(session.userId, PERMISSIONS.manageAllMembers)),
  update: async (session: Session, row: BaseRow) =>
    session.userId === row.id ||
    (await userCan(session.userId, PERMISSIONS.manageAllMembers)),
  writableFields: async (session: Session, row: BaseRow) => {
    if (await userCan(session.userId, "manageAllMembers"))
      return WRITABLE_FIELDS.memberFull;
    if (session.userId === row.id) return WRITABLE_FIELDS.memberSelf;
    return [];
  },
};

export function sanitizeFields<T extends Record<string, any>>(
  obj: T,
  fields: readonly string[],
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => fields.includes(key)),
  ) as Partial<T>;
}
