import { db, count, Course, desc } from "astro:db";

export async function getCoursesPage(page: number, perPage = 5) {
  if (page < 1) page = 1;

  const totalResult = await db.select({ count: count(Course.id) }).from(Course);
  console.log({ totalResult });

  const totalCount = totalResult[0].count;
  const totalPages = Math.ceil(totalCount / perPage);

  if (page > totalPages && totalPages > 0) {
    return { redirect: true };
  }

  const courses = await db
    .select()
    .from(Course)
    .orderBy(desc(Course.date))
    .limit(perPage)
    .offset((page - 1) * perPage);

  console.log({ courses, page, totalPages, perPage });

  return {
    courses,
    page,
    totalCount,
    totalPages,
    perPage,
  };
}
