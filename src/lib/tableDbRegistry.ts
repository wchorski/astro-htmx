// src/lib/tableRegistry.ts
import type { TableRow } from "@ty/Table";
import { Course, Credit, db, eq, Member, Location } from "astro:db";
import { PhoneSanitizer } from "./sanatizers";
import { formatPhoneToE164Manual, localDateTimeToRealDate } from "./formatters";
import { z, ZodError } from "astro/zod";
import type { MemberCredit } from "@ty/Schema";

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
  dateLocal: z.string(),
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
    if (!phoneSanatized) throw new Error("phone bad");
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
    try {
      const memberExists = memberId
        ? await db.select().from(Member).where(eq(Member.id, memberId)).get()
        : await db
            .select()
            .from(Member)
            .where(eq(Member.phone, phoneSanatized))
            .get();
      if (!memberExists) throw new Error("member does not exist");
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
    } catch (error) {
      console.log("❌ tableRegistry error");
      if (error instanceof Error) {
        console.log(error);
      }
    }
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

    try {
      const existingLocation = await db
        .select()
        .from(Location)
        .where(eq(Location.id, Number(validated.id)))
        .get();

      if (!existingLocation)
        throw new Error(`location does not exist with id ${validated.id}`);

      await db
        .update(Location)
        //   TODO memberExists ? {id: memberExists} : {id: memberId}
        .set(validated)
        .where(eq(Location.id, validated.id));
    } catch (e) {
      console.log("❌ tableDBRegistry /attendance/admin/location/id");

      const error =
        e instanceof ZodError
          ? e.flatten() // ← structured object, no parsing needed
          : e instanceof Error
            ? e.message
            : "500 server error";
      console.log(error);
    }
  },
  "/attendance/admin/courses/id": async (row) => {
    const validated = courseFormSchema.parse(row);

    try {
      const existingCourse = await db
        .select()
        .from(Course)
        .where(eq(Course.id, Number(validated.id)))
        .get();

      if (!existingCourse)
        throw new Error(`course does not exist with id ${validated.id}`);

      const courseLocation = await db
        .select()
        .from(Location)
        .where(eq(Location.id, existingCourse.locationId))
        .get();

      if (!courseLocation)
        throw new Error(
          `location id: ${existingCourse.locationId} does not exist`,
        );

      // if (validated.dateLocal) {
      //   validated.date = localDateTimeToRealDate(
      //     validated.dateLocal,
      //     courseLocation.timezone,
      //   );
      // }

      await db
        .update(Course)
        //   TODO memberExists ? {id: memberExists} : {id: memberId}
        .set({
          date: localDateTimeToRealDate(
            validated.dateLocal,
            courseLocation.timezone,
          ),
          ...validated,
        })
        .where(eq(Course.id, validated.id));
    } catch (e) {
      console.log("❌ tableDBRegistry /attendance/admin/courses/id");

      const error =
        e instanceof ZodError
          ? e.flatten() // ← structured object, no parsing needed
          : e instanceof Error
            ? e.message
            : "500 server error";
      console.log(error);
    }
  },
  members: async (row) => {
    /* db.update(Users)... */
  },
  credits: async (row) => {
    /* db.update(Todos)... */
  },
  courses: async (row) => {
    /* db.update(Posts)... */
  },
} satisfies Record<string, SaveFn>;

// Derived automatically from the object keys
export type TableRegistryType = keyof typeof tableRegistry;
// → "memberCredits" | "members" | "credits" | "courses"
