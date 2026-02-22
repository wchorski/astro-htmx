import { db, count, Member, desc, asc } from "astro:db";

export async function getMembersPage(page: number, perPage = 12) {
  if (page < 1) page = 1;

  const totalResult = await db.select({ count: count(Member.id) }).from(Member);

  const totalCount = totalResult[0].count;
  const totalPages = Math.ceil(totalCount / perPage);

  if (page > totalPages && totalPages > 0) {
    return { redirect: true };
  }

  const members = await db
    .select()
    .from(Member)
    .orderBy(asc(Member.last_name))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return {
    members,
    page,
    totalCount,
    totalPages,
    perPage,
  };
}
