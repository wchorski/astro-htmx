import { db } from "@db/db";
import { User, Credit } from "@db/schema";
import { count } from "drizzle-orm";
import { crud } from "./crudRegistry";
import { TEST_ADMIN_SESSION } from "./auth/session";

const session = TEST_ADMIN_SESSION;

export async function getCreditsPage(page: number, perPage = 12) {
  if (page < 1) page = 1;

  const totalResult = await db.select({ count: count(User.id) }).from(User);

  const totalCount = totalResult[0].count;
  const totalPages = Math.ceil(totalCount / perPage);

  if (page > totalPages && totalPages > 0) {
    return { redirect: true };
  }

  //   const credits = await crud.credits.readMany(session)
  const users = await crud.users.readMany(session);
  const courses = await crud.courses.readMany(session);

  const credits = await db
    .select()
    .from(Credit)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return {
    credits,
    courses,
    users,
    page,
    totalCount,
    totalPages,
    perPage,
  };
}
