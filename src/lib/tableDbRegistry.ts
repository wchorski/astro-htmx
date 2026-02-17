// src/lib/tableRegistry.ts
import type { TableRow } from "@ty/Table";
import { Credit, db, eq, Member } from "astro:db";
import { PhoneSanitizer } from "./sanatizers";
import { formatPhoneToE164Manual } from "./formatters";

type SaveFn = (row: TableRow) => Promise<void>;

export const tableRegistry = {
  memberCredits: async (row) => {
    /* db.update(Users)... */
    // console.log("memberCredits");
    // console.log({ row });
    //? example result
    // memberCredits
    // {
    //     row: {
    //         id: 9,
    //         memberId: 5,
    //         first_name: 'test',
    //         last_name: 'Ruddom',
    //         middle_initial: '',
    //         email: 'oruddom4@forbes.com',
    //         phone: '+15157941939',
    //         address1: '058 Pond Pass',
    //         city: 'Des Moines',
    //         state: 'Iowa',
    //         zip: 69953,
    //         attended: false
    //     }
    // }
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
    } = row;
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
    // TODO MORE VALIDATION
    // TODO 1. validate (prob shouldn't allow changing of memberId or creditId)
    const phoneSanatized = formatPhoneToE164Manual(phone);
    
    if (!phoneSanatized) throw new Error("phone bad");
    
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
      if (error instanceof Error) {
        console.log(error.message);
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
