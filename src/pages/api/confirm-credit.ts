// src/pages/api/confirm-credit.ts
import type { APIRoute } from "astro";
import { db, Credit, Course, Member } from "astro:db";
import { eq } from "astro:db";
import { z } from "zod";

const formSchema = z.object({
  memberId: z.coerce.number(),
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

    const { memberId, courseId } = result.data;

    const classExists = await db
      .select()
      .from(Course)
      .where(eq(Course.id, courseId))
      .limit(1);

    if (classExists.length === 0) {
      return redirect(
        `/partials/credit-form?error=${encodeURIComponent(`Course with ID ${courseId} does not exist`)}`,
      );
    }

    const memberExists = await db
      .select()
      .from(Member)
      .where(eq(Member.id, memberId))
      .limit(1);

    if (memberExists.length === 0) {
      return redirect(
        `/partials/credit-form?error=${encodeURIComponent(`Member with ID ${memberExists} does not exist`)}`,
      );
    }

    // TODO check if member already has credit created for class?
    // check if attended === true

    // Insert credit
    const attended = true;
    await db
      .insert(Credit)
      .values({ memberId, courseId, date: new Date(), attended });

    // Redirect to form with success and trigger list update
    return redirect("/partials/credit-form?success=Credit+successfully+added");
  } catch (error) {
    console.error(error);
    return redirect("/partials/credit-form?error=An+unexpected+error+occurred");
  }
};
