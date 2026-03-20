// src/pages/api/confirm-credit.ts
import { PhoneSanitizer } from "@lib/sanatizers";
import type { APIRoute } from "astro";
import { db, Credit, Course, User } from "astro:db";
import { eq, or } from "astro:db";
import { z } from "astro/zod";

const formSchema = z.object({
  userId: z.coerce.number().optional(),
  courseId: z.coerce.number(),
  asipId: z.coerce.number(),
  regNum: z.coerce.number(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  middle_initial: z.string().optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  // state: z.enum(["Illinois", "Indiana", "Iowa"], {
  //   errorMap: () => ({ message: "Please select a valid state" })
  // }),
  state: z.string().min(1, "State is required"),
  zip: z.coerce.number().min(10000).max(99999, "Invalid ZIP code"),
});

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate
    const result = formSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessages = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
        .join("; ");

      // Redirect to form partial with error
      return redirect(
        `/partials/credit-form?error=${encodeURIComponent(errorMessages)}`,
      );
    }

    const {
      userId,
      courseId,
      asipId,
      regNum,
      first_name,
      last_name,
      middle_initial,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      zip,
    } = result.data;

    const courseExists = await db
      // TODO i could combine query for course + credits here
      .select()
      .from(Course)
      .where(eq(Course.id, courseId))
      .get();

    if (!courseExists) {
      return redirect(
        `/partials/credit-form?error=${encodeURIComponent(`Course with ID ${courseId} does not exist`)}`,
      );
    }

    const courseCredits = await db
      .select()
      .from(Credit)
      .where(eq(Credit.courseId, courseId));

    const phoneSanatized: string | null = PhoneSanitizer.sanitize(phone);
    if (!phoneSanatized) {
      return redirect(
        `/partials/credit-form?error=${encodeURIComponent(`Fix phone formatting`)}`,
      );
    }

    const memberExists = userId
      ? await db.select().from(User).where(eq(User.id, userId)).get()
      : await db
          .select()
          .from(User)
          .where(eq(User.phone, phoneSanatized))
          .get();
    // TODO member may not exist yet (if this app doesn't also register them)
    // if (!memberExists) {
    //   return redirect(
    //     `/partials/credit-form?error=${encodeURIComponent(`User with ID ${memberExists} does not exist`)}`,
    //   );
    // }

    // let newMember = null;

    // TODO validate inputs

    if (!memberExists) {
      const [newMember] = await db
        .insert(User)
        .values({
          asipId,
          regNum,
          first_name,
          last_name,
          middle_initial,
          phone,
          email,
          address1,
          address2,
          city,
          state,
          zip,
        })
        .returning();

      await db.insert(Credit).values({
        userId: newMember.id,
        courseId,
        date: new Date(),
        attended: true,
      });
    } else {
      // member does exist
      const userCredit = courseCredits.find(
        (credit) => credit.userId === memberExists.id,
      );

      if (userCredit && userCredit.attended)
        return new Response(
          `
            User ${memberExists.id} ${memberExists.first_name}
            already attended: ${userCredit.attended}
          `,
          { status: 411 },
        );

      await db.insert(Credit).values({
        userId: memberExists.id,
        courseId,
        date: new Date(),
        attended: true,
      });
    }

    // Redirect to form with success and trigger list update
    return redirect("/partials/credit-form?success=Credit+successfully+added");
  } catch (error) {
    console.error(error);
    return redirect("/partials/credit-form?error=An+unexpected+error+occurred");
  }
};
