import { throwErrorsForCRUD, ValidationError } from "@lib/errors";
import type { MemberSelect } from "@ty/Schema";
import { z } from "astro/zod";
import { or, eq, like, sql, db, Member } from "astro:db";

//? needs special validation because everything can be partial string ('fuzzy')
export const MemberSearchSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Must be more than 3 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ""))
      .optional(),

    first_name: z.string().trim().toLowerCase().min(2).optional(),
    last_name: z.string().trim().toLowerCase().min(2).optional(),
  })
  .refine(
    (data) =>
      [data.id, data.email, data.phone, data.first_name, data.last_name].filter(
        Boolean,
      ).length >= 1,
    {
      message:
        "Provide at least one of id, email, phone, first name, or last name",
    },
  );

export async function searchForMembers(member: Partial<MemberSelect>) {
  //! must convert any empty strings "" to undefined
  try {
    const validated = MemberSearchSchema.safeParse(member);

    if (!validated.success) {
      console.log(validated.error.flatten());
      throw new ValidationError(validated.error.flatten());
    }

    const { id, phone, email, first_name, last_name } = validated.data;

    const conditions = [];

    if (id) conditions.push(eq(Member.id, id));
    // if (email) conditions.push(eq(Member.email, email));
    //? if partial string checking instead of full email (not exact like above)
    if (email) conditions.push(like(sql`lower(${Member.email})`, `%${email}%`));
    // if (phone) conditions.push(eq(Member.phone, phone));
    if (phone) conditions.push(like(sql`${Member.phone}`, `%${phone}%`));
    if (first_name)
      conditions.push(
        like(sql`lower(${Member.first_name})`, `%${first_name}%`),
      );
    if (last_name)
      conditions.push(like(sql`lower(${Member.last_name})`, `%${last_name}%`));

    // Safety: should never be empty because schema requires at least one,
    // but keep a guard anyway to avoid accidental full-table scans.
    if (conditions.length === 0) {
      throw new ValidationError({
        formErrors: ["Provide at least one search field"],
        fieldErrors: {},
      });
    }

    const members = await db
      .select()
      .from(Member)
      .where(or(...conditions))
      .limit(25);

    return members;
  } catch (e) {
    throwErrorsForCRUD(e);
  }
}
