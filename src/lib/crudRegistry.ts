// src/lib/crudRegistry.ts
import type { TableRow } from "@ty/Table";
import { db, eq, Member, Course, Credit, Location } from "astro:db";
import { ConflictError, NotFoundError, throwErrorsForCRUD } from "@lib/errors";
import { validate } from "./validate";
import { localDateTimeToRealDate } from "./formatters";
import {
  createWordpressEventPost,
  updateWordpressEventPost,
} from "./getsetWordpressPost";

type CreateFn = (row: Omit<TableRow, "id">) => Promise<TableRow>;
type ReadFn = (id: string) => Promise<TableRow | null>;
type UpdateFn = (row: Partial<TableRow> & { id: string }) => Promise<TableRow>;
type DeleteFn = (id: string) => Promise<TableRow>;

type CrudEntry = {
  create: CreateFn;
  read: ReadFn;
  update: UpdateFn;
  delete: DeleteFn;
};

export const crudRegistry = {
  members: {
    create: async (row) => {
      try {
        const validated = validate.memberCreate.parse(row);

        const [result] = await db.insert(Member).values(validated).returning();
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const row = await db
          .select()
          .from(Member)
          .where(eq(Member.id, validId))
          .get();
        if (!row) throw new NotFoundError(`Member ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (row) => {
      try {
        const validated = validate.memberUpdate.parse(row);

        const [result] = await db
          .update(Member)
          .set(validated)
          .where(eq(Member.id, validated.id))
          .returning();
        if (!result)
          throw new NotFoundError(`Member ${validated.id} not found`);
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Member)
          .where(eq(Member.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Member ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
  course: {
    create: async (row) => {
      try {
        const validated = validate.courseCreate.parse(row);

        const location = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validated.locationId))
          .get();

        if (!location)
          throw new NotFoundError(
            `location: ${validated.locationId} does not exist`,
          );

        const realDate = localDateTimeToRealDate(
          validated.dateCivil,
          location.timezone,
        );

        const wpPost = await createWordpressEventPost({
          ...validated,
          date: realDate,
        });

        const [result] = await db
          .insert(Course)
          .values({
            ...validated,
            date: realDate,
            wpPostId: wpPost.id,
          })
          .returning();
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const row = await db
          .select()
          .from(Course)
          .where(eq(Course.id, validId))
          .get();
        if (!row) throw new NotFoundError(`Course ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (row) => {
      try {
        const validated = validate.courseUpdate.parse(row);

        const location = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validated.locationId))
          .get();

        if (!location)
          throw new NotFoundError(
            `location: ${validated.locationId} does not exist`,
          );
        const realDate = localDateTimeToRealDate(
          validated.dateCivil,
          location.timezone,
        );
        const wpPost = await updateWordpressEventPost({
          ...validated,
          date: realDate,
        });
        const [result] = await db
          .update(Course)
          .set({
            ...validated,
            date: realDate,
            wpPostId: wpPost.id,
          })
          .where(eq(Course.id, validated.id))
          .returning();
        if (!result) throw new NotFoundError(`Course ${row.id} not found`);
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Course)
          .where(eq(Course.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Course ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },

  credits: {
    create: async (row) => {
      try {
        const validated = validate.creditCreate.parse(row);

        const [result] = await db
          .insert(Credit)
          .values({
            ...validated,
            date: new Date(),
          })
          .returning();
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const row = await db
          .select()
          .from(Credit)
          .where(eq(Credit.id, validId))
          .get();
        if (!row) throw new NotFoundError(`Credit ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (row) => {
      try {
        const validated = validate.creditUpdate.parse(row);

        const [result] = await db
          .update(Credit)
          .set(validated)
          .where(eq(Credit.id, validated.id))
          .returning();
        if (!result) throw new NotFoundError(`Credit ${row.id} not found`);
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Credit)
          .where(eq(Credit.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Credit ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
  locations: {
    create: async (row) => {
      try {
        const validated = validate.locationCreate.parse(row);

        const [result] = await db
          .insert(Location)
          .values(validated)
          .returning();
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const row = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validId))
          .get();
        if (!row) throw new NotFoundError(`Location ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },

    update: async (row) => {
      try {
        const validated = validate.locationUpdate.parse(row);
        const validId = validate.id.parse(row.id);
        const [result] = await db
          .update(Location)
          .set(validated)
          .where(eq(Location.id, validId))
          .returning();
        if (!result) throw new NotFoundError(`Location ${row.id} not found`);
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Member)
          .where(eq(Member.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Member ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
  memberCredits: {
    create: async (row) => {
      try {
        const validated = validate.memberCreditCreate.parse(row);

        return await db.transaction(async (tx) => {
          let member: typeof Member.$inferSelect;
          let memberId: number;

          // --- Branch 1: link to existing member ---
          if ("memberId" in validated) {
            memberId = validated.memberId;

            const found = await tx
              .select()
              .from(Member)
              .where(eq(Member.id, memberId))
              .get();

            if (!found) throw new NotFoundError(`Member ${memberId} not found`);
            member = found;
          } else {
            const [created] = await tx
              .insert(Member)
              .values({
                first_name: validated.first_name,
                last_name: validated.last_name,
                phone: validated.phone,
                email: validated.email,
                address1: validated.address1,
                city: validated.city,
                state: validated.state,
                zip: validated.zip,
              })
              .returning();

            if (!created) throw new Error("Failed to create member");

            member = created;
            memberId = created.id;
          }

          // --- Create credit linked to resolved memberId ---
          const [credit] = await tx
            .insert(Credit)
            .values({
              attended: validated.attended,
              courseId: validated.courseId,
              memberId,
              date: new Date(),
            })
            .returning();

          if (!credit) throw new Error("Failed to create credit");

          // flat return: member + credit (ensure credit.id wins)
          return { ...member, ...credit, memberId: member.id, id: credit.id };
        });
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const row = await db
          .select()
          .from(Credit)
          .innerJoin(Member, eq(Credit.memberId, Member.id))
          .where(eq(Credit.id, validId))
          .get();
        if (!row) throw new NotFoundError(`Credit ${id} not found`);
        return {
          ...row.Member,
          ...row.Credit,
          memberId: row.Member.id, // preserve member id before Credit.id overwrites it
          id: row.Credit.id,
        };
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },

    update: async (row) => {
      try {
        const { id, memberId, courseId, attended, ...memberFields } =
          validate.memberCreditUpdate.parse(row);

        // two updates but in a transaction so they succeed or fail together
        const result = await db.transaction(async (tx) => {
          const [credit] = await tx
            .update(Credit)
            .set({ attended })
            .where(eq(Credit.id, id))
            .returning();
          if (!credit) throw new NotFoundError(`Credit ${id} not found`);

          const [member] = await tx
            .update(Member)
            .set(memberFields)
            .where(eq(Member.id, memberId))
            .returning();
          if (!member) throw new NotFoundError(`Member ${memberId} not found`);

          return { ...credit, ...member };
        });

        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Credit)
          .where(eq(Credit.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Credit ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
} satisfies Record<string, CrudEntry>;

export type CrudRegistryType = keyof typeof crudRegistry;
