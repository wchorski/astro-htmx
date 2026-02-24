import { z } from "astro/zod";
import { formatPhoneToE164Manual } from "./formatters";

export const validate = {
  id: z.coerce.number(),

  member: z.object({
    id: z.coerce.number(),
    first_name: z.string().min(3, "Must be more than 3 characters"),
    last_name: z.string().min(3, "Must be more than 3 characters"),
    middle_initial: z.string().max(1, "no more than one character").optional(),
    phone: z
      .string()
      .transform((val) => formatPhoneToE164Manual(val))
      .refine((val) => val !== null, "Phone must be 10 digits or E.164 format"),
    email: z.string().email("Invalid email address"),
    address1: z.string().min(3, "Must be more than 3 characters"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.coerce.number().min(10000).max(99999, "Invalid ZIP code"),
  }),

  get memberCreate() {
    return this.member.omit({ id: true });
  },

  get memberUpdate() {
    return this.member;
  },

  credit: z.object({
    id: z.coerce.number(),
    memberId: z.coerce.number(),
    courseId: z.coerce.number(),
    grade: z.string().optional(),
    attended: z.coerce.boolean(),
  }),

  get creditCreate() {
    return this.credit.omit({ id: true });
  },
  get creditUpdate() {
    return this.credit;
  },

  location: z.object({
    id: z.coerce.number(),
    name: z.string().min(3, "Must be more than 3 characters"),
    address: z.string().min(3, "Must be more than 3 characters"),
    city: z.string().min(3, "Must be more than 3 characters"),
    state: z.string().min(2, "Must be more than 3 characters"),
    zip: z.coerce.number().min(10000).max(99999, "Invalid ZIP code"),
    timezone: z.string().min(8, "Must be more than 8 characters"),
    description: z.string().optional(),
  }),

  get locationCreate() {
    return this.location.omit({ id: true });
  },
  get locationUpdate() {
    return this.location;
  },

  course: z.object({
    id: z.coerce.number(),
    wpPostId: z.coerce.number(),
    subject: z.string().min(3, "Must be more than 3 characters"),
    description: z.string().optional(),
    // handles by crud
    // date: z.date(),
    dateCivil: z.string(),
    locationId: z.coerce.number(),
  }),

  get courseCreate() {
    return this.course.omit({ id: true });
  },
  get courseUpdate() {
    return this.course;
  },

  //   MUTATIONS
  get memberCreditCreate() {
    return this.credit.omit({ id: true });
  },

  get memberCreditUpdate() {
    return this.credit.merge(this.member.omit({ id: true }));
  },
};
