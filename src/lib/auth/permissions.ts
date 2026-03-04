// @lib/permissions.ts
import { and, db, eq, Member, Role } from "astro:db";

export const PERMISSIONS = {
  manageAllMembers:  "manageAllMembers",
  viewAllMembers:   "viewAllMembers",
  manageAllCourses:  "manageAllCourses",
  viewAllCourses:   "viewAllCourses",
  manageAllCredits:  "manageAllCredits",
  viewAllCredits:   "viewAllCredits",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// TODO auth

export async function userCan(userId: number, permission: Permission): Promise<boolean> {
  const result = await db
    .select({ permissions: Role.permissions })
    .from(Member)
    .innerJoin(Role, eq(Role.id, Member.roleId))
    .where(eq(Member.id, userId))
    .get();

  const permissions = result?.permissions as Permission[] | null;;
  if (!Array.isArray(permissions)) return false; // guard against malformed json

  return permissions.includes(permission);
}

export const WRITABLE_FIELDS = {
  memberSelf: ["first_name", "last_name", "email", "phone", "address1", "address2", "city", "state", "zip"],
  memberFull: ["first_name", "last_name", "email", "phone", "address1", "address2", "city", "state", "zip", "attended", "courseId"], // admin can touch credits fields
} as const;

export type WritableScope = keyof typeof WRITABLE_FIELDS;

export const memberPolicy = {
  read:   async (session, row) => session.userId === row.id || await userCan(session.userId, PERMISSIONS.manageAllMembers),
  update: async (session, row) => session.userId === row.id || await userCan(session.userId, PERMISSIONS.manageAllMembers),
  writableFields: async (session, row) => {
    if (await userCan(session, "manageAllMembers")) return WRITABLE_FIELDS.memberFull;
    if (session.userId === row.id)          return WRITABLE_FIELDS.memberSelf;
    return [];
  },
};

export function sanatizeFields<T extends Record<string, any>>(
  obj: T,
  fields: readonly string[],
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => fields.includes(key))
  ) as Partial<T>;
}