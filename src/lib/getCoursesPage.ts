import { db, count, Course, Location, desc } from "astro:db";

export async function getCoursesPage(page: number, perPage = 12) {
  if (page < 1) page = 1;

  const totalResult = await db.select({ count: count(Course.id) }).from(Course);

  const totalCount = totalResult[0].count;
  const totalPages = Math.ceil(totalCount / perPage);

  if (page > totalPages && totalPages > 0) {
    return { redirect: true };
  }

  // TODO where is the auth?
  const courses = await db
    .select()
    .from(Course)
    .orderBy(desc(Course.date))
    .limit(perPage)
    .offset((page - 1) * perPage);

  // TODO move this into one db call
  const locations = await db
    .select()
    .from(Location)
    // .limit(perPage)
    // .offset((page - 1) * perPage);

  return {
    courses,
    locations,
    page,
    totalCount,
    totalPages,
    perPage,
  };
}