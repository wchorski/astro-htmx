import { z } from "astro/zod";
import { formatPhoneToE164Manual } from "./formatters";

export const validate = {
  memberCreate: z.object({
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
};
