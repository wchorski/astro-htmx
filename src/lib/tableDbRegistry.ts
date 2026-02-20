// src/lib/tableRegistry.ts
import type { TableRow } from "@ty/Table";
import { Course, Credit, db, eq, and, gte, Member, Location } from "astro:db";
import { PhoneSanitizer } from "./sanatizers";
import { formatPhoneToE164Manual, localDateTimeToRealDate } from "./formatters";
import { z, ZodError } from "astro/zod";
import type { MemberCredit } from "@ty/Schema";
import { NotFoundError } from "./errors";

type SaveFn = (row: TableRow) => Promise<void>;

const memberCreditsFormSchema = z.object({
  //   courseId: z.coerce.number(),
  id: z.coerce.number(),
  memberId: z.coerce.number(),
  first_name: z.string().min(3, "Must be more than 3 characters"),
  last_name: z.string().min(3, "Must be more than 3 characters"),
  middle_initial: z.string().max(1, "no more than one character").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address1: z.string().min(3, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.coerce.number().min(10000).max(99999, "Invalid ZIP code"),
  attended: z.coerce.boolean(),
});

const courseFormSchema = z.object({
  id: z.coerce.number(),
  subject: z.string().min(3, "Must be more than 3 characters"),
  description: z.string().optional(),
  // date: z.date(),
  dateCivil: z.string(),
  locationId: z.coerce.number(),
});
const locationFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(3, "Must be more than 3 characters"),
  address: z.string().min(3, "Must be more than 3 characters"),
  city: z.string().min(3, "Must be more than 3 characters"),
  state: z.string().min(2, "Must be more than 3 characters"),
  zip: z.coerce.number().min(10000).max(99999, "Invalid ZIP code"),
  timezone: z.string().min(5, "Must be more than 3 characters"),
  description: z.string().optional(),
});

export const tableRegistry = {
  memberCredits: async (row) => {
    // console.log("memberCredits");
    // console.log({ row });

    // TODO 1. validate (prob shouldn't allow changing of memberId or creditId)

    const phoneSanatized = formatPhoneToE164Manual(row.phone);
    if (!phoneSanatized) throw new Error("phoneSanatized bad format");
    const validated = memberCreditsFormSchema.parse({
      ...row,
      phone: phoneSanatized,
    });
    // console.log({ validated });
    const {
      id: creditId,
      memberId,
      phone,
      attended,
      first_name,
      last_name,
      middle_initial,
      email,
      address1,
      city,
      state,
      zip,
    } = validated as MemberCredit;
    const updatedMemberVals = {
      id: memberId,
      first_name,
      last_name,
      middle_initial,
      email,
      phone,
      address1,
      city,
      state,
      zip,
    };

    // 2. find member if exists by id or phone #

    const memberExists = memberId
      ? await db.select().from(Member).where(eq(Member.id, memberId)).get()
      : await db
          .select()
          .from(Member)
          .where(eq(Member.phone, phoneSanatized))
          .get();
    if (!memberExists)
      throw new NotFoundError(`member ${memberId} does not exist`);
    // 3. update credit attended true/false and member data
    await db
      .update(Member)
      //   TODO memberExists ? {id: memberExists} : {id: memberId}
      .set(updatedMemberVals)
      .where(eq(Member.id, memberExists.id));

    await db
      .update(Credit)
      .set({
        //   memberId: memberExists.id,
        //   courseId,
        date: new Date(),
        attended,
      })
      .where(eq(Credit.id, creditId));

    // 4. why am i sending full data back to be processed? can't i partially send back only changed fields?
    //? don't worry about it too much. unless app is on huge scale
    // EXAMPLE
    // type SaveFn = (row: Partial<TableRow> & { id: number }) => Promise<void>;

    // const original: TableRow = JSON.parse(raw.get("_row") as string);

    // // Build only the changed fields
    // const updates: Partial<TableRow> = {};
    // for (const key of headers) {
    //   if (String(row[key]) !== String(original[key])) {
    //     updates[key] = row[key];
    //   }
    // }

    // if (Object.keys(updates).length === 0) {
    //   // Nothing changed — skip the DB call, just return the view
    // } else {
    //   await entry.save({ id: row.id, ...updates });
    // }
  },
  "/attendance/admin/locations/id": async (row) => {
    // console.log("/attendance/admin/locations/id");
    // console.log({ row });
    const validated = locationFormSchema.parse(row);

    const existingLocation = await db
      .select()
      .from(Location)
      .where(eq(Location.id, Number(validated.id)))
      .get();

    if (!existingLocation)
      throw new NotFoundError(
        `location does not exist with id ${validated.id}`,
      );

    if (existingLocation.timezone !== validated.timezone) {
      // Compute cutoff (1 year ago from "now")
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const relatedCourses = await db
        .select()
        .from(Course)
        .where(
          and(
            eq(Course.locationId, validated.id),
            gte(Course.date, oneYearAgo),
          ),
        );

      if (relatedCourses.length > 9999)
        throw new Error(
          "processing WAY to many relatedCourses when timezone switched, consider changing the hardcoded oneYearAgo value",
        );

      if (relatedCourses.length > 0) {
        const coursesTimeZoneUpdated = relatedCourses.map(
          (course) =>
            db
              .update(Course)
              .set({
                // recompute per-course derived instant
                date: localDateTimeToRealDate(
                  course.dateCivil,
                  validated.timezone,
                ),
              })
              .where(eq(Course.id, course.id)), // ✅ IMPORTANT
        );
        console.log(
          "coursesTimeZoneUpdated coursesTimeZoneUpdated coursesTimeZoneUpdated",
        );
        // console.log(JSON.stringify(coursesTimeZoneUpdated, null, 2));
        // Drizzle's batch() expects a non-empty array typed as [head, ...tail]
        const [head, ...tail] = coursesTimeZoneUpdated;
        await db.batch([head, ...tail]); // ✅ one call / implicit transaction on libSQL
      }
    }

    await db
      .update(Location)
      //   TODO memberExists ? {id: memberExists} : {id: memberId}
      .set(validated)
      .where(eq(Location.id, validated.id));
  },
  "/attendance/admin/courses/id": async (row) => {
    const validated = courseFormSchema.parse(row);

    const existingCourse = await db
      .select()
      .from(Course)
      .where(eq(Course.id, Number(validated.id)))
      .get();

    if (!existingCourse)
      throw new NotFoundError(`course does not exist with id ${validated.id}`);

    const courseLocation = await db
      .select()
      .from(Location)
      .where(eq(Location.id, validated.locationId))
      .get();

    if (!courseLocation)
      throw new NotFoundError(
        `location id: ${validated.locationId} does not exist`,
      );

    await db
      .update(Course)
      //   TODO memberExists ? {id: memberExists} : {id: memberId}
      .set({
        date: localDateTimeToRealDate(
          validated.dateCivil,
          courseLocation.timezone,
        ),
        ...validated,
      })
      .where(eq(Course.id, validated.id));
  },
  // members: async (row) => {
  //   /* db.update(Users)... */
  // },
  // credits: async (row) => {
  //   /* db.update(Todos)... */
  // },
  // courses: async (row) => {
  //   /* db.update(Posts)... */
  // },
} satisfies Record<string, SaveFn>;

// Derived automatically from the object keys
export type TableRegistryType = keyof typeof tableRegistry;
// → "memberCredits" | "members" | "credits" | "courses"
