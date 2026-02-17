//! don't use astro:actions
// import { db, eq, Credit, Course, Member } from "astro:db";
// import { ActionError, defineAction } from "astro:actions";
// import { z } from "astro/zod";

// export const server = {
//   confirmClassCredit: defineAction({
//     accept: "form", // ← ADD THIS LINE
//     // Actions include type safety with Zod, removing the need
//     // to check if typeof {value} === 'string' in your pages
//     input: z.object({
//       memberId: z.coerce.number(),
//       courseId: z.coerce.number(),
//       asipId: z.coerce.number(),
//       regNum: z.coerce.number(),
//       first_name: z.string(),
//       last_name: z.string(),
//       middle_initial: z.string().optional(),
//       phone: z.string(),
//       email: z.string().email(),
//       address1: z.string(),
//       address2: z.string().optional(),
//       city: z.string(),
//       state: z.string(),
//       zip: z.coerce.number(),
//     }),
//     handler: async (input) => {
//       console.log({ input });
//       const { memberId, courseId } = input;
//       // TODO check input for member stuff and check attendance
//       // Check if class exists
//       const classExists = await db
//         .select()
//         .from(Course)
//         .where(eq(Course.id, courseId))
//         .limit(1);

//       if (classExists.length === 0) {
//         throw new ActionError({
//           code: "NOT_FOUND",
//           message: `Course with ID ${courseId} does not exist in the database.`,
//         });
//       }

//       //   Check if member exists
//       const memberExists = await db
//         .select()
//         .from(Member)
//         .where(eq(Member.id, memberId))
//         .limit(1);

//       if (memberExists.length === 0) {
//         throw new ActionError({
//           code: "NOT_FOUND",
//           message: `Member with ID ${memberId} does not exist.`,
//         });
//       }

//       const attended = true;

//       try {
//         const updatedCredits = await db
//           .insert(Credit)
//           .values({ memberId, courseId, date: new Date(), attended })
//           .returning(); // Return the updated comments
//         return updatedCredits;
//       } catch (error) {
//         console.log({ error });
//         throw new ActionError({
//           code: `INTERNAL_SERVER_ERROR`,
//           message: `Failed to save credit. Please try again.`,
//         });
//       }
//     },
//   }),
// };
