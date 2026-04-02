// @lib/permissions.ts
import { and, db, eq, User, Role } from "astro:db";
import type { Session } from "./session";
import type { BaseRow } from "@ty/FieldConfig";
import { PERMISSIONS } from "./roles";

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
  userSelf: [
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
  userFull: [
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
  ],
  creditFull: ["userId", "courseId", "grade", "attended"],
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
      return WRITABLE_FIELDS.userFull;

    if (session.userId === row.id) return WRITABLE_FIELDS.userSelf;
    return [];
  },
};

export const creditPolicy = {
  read: async (session: Session, row: BaseRow) =>
    session.userId === row.id ||
    (await userCan(session.userId, PERMISSIONS.manageAllCredits)),
  update: async (session: Session, row: BaseRow) =>
    session.userId === row.id ||
    (await userCan(session.userId, PERMISSIONS.manageAllCredits)),
  writableFields: async (session: Session, row: BaseRow) => {
    if (await userCan(session.userId, "manageAllCredits"))
      return WRITABLE_FIELDS.creditFull;

    //? do not allow members to edit their own credit
    // if (session.userId === row.id) return WRITABLE_FIELDS.ownedCredit;
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
