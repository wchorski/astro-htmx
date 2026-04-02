import { db, User, Course, Credit, Location, Role } from "astro:db";
import { seedData } from "./seed-data";

export default async function () {
  await db.insert(Location).values(seedData.locations);
  await db.insert(Role).values(seedData.roles);

  // find and replace date
  // find: date:\s*'([^']+)',
  // replace: date: new Date('$1'),
  await db.insert(Course).values(seedData.courses);

  //! MOCK DATA, do not enter sensative data into seed
  await db.insert(User).values(seedData.users);

  // mock credits need to be added after users are added
  await db.insert(Credit).values(seedData.credits);
}
