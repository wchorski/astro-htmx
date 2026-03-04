import { db, Member, Course, Credit, Location } from "astro:db";
import { seedData } from "./seed-data";

export default async function () {
  await db.insert(Location).values(seedData.locations);
  await db.insert(Role).values(seedData.roles);

  // find and replace date
  // find: date:\s*'([^']+)',
  // replace: date: new Date('$1'),
  await db.insert(Course).values(seedData.courses);

  //! MOCK DATA, do not enter sensative data into seed
  await db.insert(Member).values(seedData.members);

  // mock credits need to be added after members are added
  await db.insert(Credit).values(seedData.credits);
}
