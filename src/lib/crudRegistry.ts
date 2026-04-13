// src/lib/crudRegistry.ts
import type { TableContext, TableRow } from "@ty/Table";

import { db } from "@db/db";
import { Course, Credit, Location, User } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  throwErrorsForCRUD,
} from "@lib/errors";
import { validate } from "./validate";
import { localDateTimeToRealDate } from "./formatters";
import {
  createWordpressEventPost,
  updateWordpressEventPost,
} from "./getsetWordpressPost";
import {
  userCan,
  sanitizeFields,
  userPolicy,
  creditPolicy,
} from "./auth/permissions";
import type { Session } from "./auth/session";
import { userCreditMap } from "./tableConfigs";
import type { FormFields } from "@ty/Form";
import type {
  CourseSelect,
  CreditSelect,
  LocationSelect,
  UserCreditFlat as CourseCreditFlat,
  UserSelect,
  RoleSelect,
} from "@ty/Schema";

type CreateFn = (
  row: Omit<TableRow, "id">,
  session: Session,
) => Promise<TableRow>;
type ReadFn<T> = (id: string, session: Session) => Promise<T>;
type ReadManyFn<T> = (session: Session) => Promise<T[]>;
// type UpdateFn = (
//   row: Partial<TableRow> & { id: string },
//   session: Session,
// ) => Promise<TableRow>;
type UpdateFn<T> = (
  inputFields: FormFields<T> & { id: string },
  session: Session,
) => Promise<T>;
type DeleteFn<T> = (id: string, session: Session) => Promise<T>;

type CrudEntry<T = TableRow> = {
  create: CreateFn;
  read: ReadFn<T>;
  readMany: ReadManyFn<T>;
  update: UpdateFn<T>;
  delete: DeleteFn<T>;
};

const { DEFAULT_ROLE_ID, WP_USERNAME, WP_APP_PASSWORD } = import.meta.env;

export const crud = {
  // TODO how to prevent create/update users from giving themselves elevated permissions?
  users: {
    create: async (row, session) => {
      try {
        // permissions for individual fields verses whole schema... what a pain...
        // const fields = await userPolicy.writableFields(session, null);

        // const sanitized = sanitizeFields(row, fields);

        const validated = validate.userCreate.parse(row);

        const [result] = await db
          .insert(User)
          // TODO move this to frontend form instead.
          .values({ ...validated, role_id: Number(DEFAULT_ROLE_ID) ?? null })
          .returning();

        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id, session) => {
      try {
        // TODO add in auth. mutation for credit and user maybe tricky
        // const fields = await creditPolicy.writableFields(session, null);
        // const sanitized = sanitizeFields(row, fields);
        const validId = validate.id.parse(id);
        const [row] = await db
          .select()
          .from(User)
          .where(eq(User.id, validId))
          .limit(1);
        if (!row) throw new NotFoundError(`User ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    readMany: async (session) => {
      try {
        const users = await db.select().from(User);
        // .limit(perPage)
        // .offset((page - 1) * perPage);
        return users;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (row, session) => {
      try {
        // TODO add in auth. mutation for credit and user maybe tricky
        // const fields = await creditPolicy.writableFields(session, null);
        // const sanitized = sanitizeFields(row, fields);
        const validated = validate.userUpdate.parse(row);

        const [result] = await db
          .update(User)
          .set(validated)
          .where(eq(User.id, validated.id))
          .returning();
        if (!result) throw new NotFoundError(`User ${validated.id} not found`);
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    // TODO authentication
    // update: async (row, session) => {
    //   try {

    //     if (!await userPolicy.update(session, row))
    //       throw new ForbiddenError("User not allowed");
    //     const fields = await userPolicy.writableFields(session, row);
    //     const sanitizedRow = sanatizeFields(row, ["id", ...fields]);

    //     const validated = validate.userUpdate.parse(sanitizedRow);

    //     const [result] = await db
    //       .update(User)
    //       .set(validated)
    //       .where(eq(User.id, validated.id))
    //       .returning();
    //     if (!result)
    //       throw new NotFoundError(`User ${validated.id} not found`);
    //     return result;
    //   } catch (e) {
    //     throwErrorsForCRUD(e);
    //   }
    // },
    delete: async (id) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(User)
          .where(eq(User.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`User ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
  courses: {
    create: async (row, session) => {
      try {
        const validated = validate.courseCreate.parse(row);

        const [location] = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validated.location_id))
          .limit(1);

        if (!location)
          throw new NotFoundError(
            `location: ${validated.location_id} does not exist`,
          );

        const realDate = localDateTimeToRealDate(
          validated.date_civil,
          location.timezone,
        );

        const wp_post_id =
          WP_USERNAME && WP_APP_PASSWORD
            ? (
                await createWordpressEventPost({
                  ...validated,
                  timestamp: realDate,
                })
              ).id
            : null;

        const [result] = await db
          .insert(Course)
          .values({
            ...validated,
            timestamp: realDate,
            wp_post_id,
          })
          .returning();
        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id, session) => {
      try {
        const validId = validate.id.parse(id);
        const [row] = await db
          .select()
          .from(Course)
          .where(eq(Course.id, validId))
          .limit(1);
        if (!row) throw new NotFoundError(`Course ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    readMany: async (session) => {
      try {
        const courses = await db.select().from(Course);
        // .limit(perPage)
        // .offset((page - 1) * perPage);
        return courses;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (row, session) => {
      try {
        const validated = validate.courseUpdate.parse(row);

        const [location] = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validated.location_id))
          .limit(1);

        if (!location)
          throw new NotFoundError(
            `location: ${validated.location_id} does not exist`,
          );
        const realDate = localDateTimeToRealDate(
          validated.date_civil,
          location.timezone,
        );
        const wp_post_id =
          WP_USERNAME && WP_APP_PASSWORD
            ? (
                await createWordpressEventPost({
                  ...validated,
                  timestamp: realDate,
                })
              ).id
            : null;
        const [result] = await db
          .update(Course)
          .set({
            ...validated,
            timestamp: realDate,
            wp_post_id: wp_post_id ?? validated.wp_post_id,
          })
          .where(eq(Course.id, validated.id))
          .returning();
        if (!result) throw new NotFoundError(`Course ${row.id} not found`);

        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id, session) => {
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
            timestamp: new Date(),
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
        const [row] = await db
          .select()
          .from(Credit)
          .where(eq(Credit.id, validId))
          .limit(1);
        if (!row) throw new NotFoundError(`Credit ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    readMany: async (session) => {
      try {
        const credits = await db.select().from(Credit);
        // .limit(perPage)
        // .offset((page - 1) * perPage);
        return credits;
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
    create: async (row, session) => {
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
    readMany: async (session) => {
      try {
        const locations = await db.select().from(Location);
        // .limit(perPage)
        // .offset((page - 1) * perPage);
        return locations;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id, session) => {
      try {
        const validId = validate.id.parse(id);
        const [row] = await db
          .select()
          .from(Location)
          .where(eq(Location.id, validId))
          .limit(1);
        if (!row) throw new NotFoundError(`Location ${id} not found`);
        return row;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },

    update: async (row, session) => {
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
          .delete(Location)
          .where(eq(Location.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Location ${id} not found`);
        return deleted;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
  courseCredits: {
    create: async (row, session) => {
      try {
        // TODO add in auth. mutation for credit and user maybe tricky
        // const fields = await creditPolicy.writableFields(session, null);
        // const sanitized = sanitizeFields(row, fields);
        const validated = validate.userCreditCreate.parse(row);

        return await db.transaction(async (tx) => {
          let user: typeof User.$inferSelect;
          let user_id: number;

          // --- Branch 1: link to existing user ---
          if ("user_id" in validated) {
            user_id = validated.user_id;

            const [found] = await tx
              .select()
              .from(User)
              .where(eq(User.id, user_id))
              .limit(1);

            if (!found) throw new NotFoundError(`User ${user_id} not found`);
            user = found;
          } else {
            const [created] = await tx
              .insert(User)
              .values({
                first_name: validated.first_name,
                last_name: validated.last_name,
                phone: validated.phone,
                email: validated.email,
                address_1: validated.address_1,
                city: validated.city,
                state: validated.state,
                zip: validated.zip,
              })
              .returning();

            if (!created) throw new Error("Failed to create user");

            user = created;
            user_id = created.id;
          }

          // --- Create credit linked to resolved user_id ---
          const [credit] = await tx
            .insert(Credit)
            .values({
              attended: validated.attended,
              course_id: validated.courseId,
              user_id,
              timestamp: new Date(),
            })
            .returning();

          if (!credit) throw new Error("Failed to create credit");

          // flat return: user + credit (ensure credit.id wins)
          return { ...user, ...credit, user_id: user.id, id: credit.id };
        });
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    read: async (id, session) => {
      try {
        // TODO add in auth. mutation for credit and user maybe tricky
        // const fields = await creditPolicy.writableFields(session, null);
        // const sanitized = sanitizeFields(row, fields);

        const validId = validate.id.parse(id);

        const [row] = await db
          .select()
          .from(Credit)
          .innerJoin(User, eq(Credit.user_id, User.id))
          .where(eq(Credit.id, validId))
          .limit(1);
        if (!row) throw new NotFoundError(`Credit ${id} not found`);
        return {
          ...row.users,
          ...row.credits,
          user_id: row.credits.id, // preserve user id before Credit.id overwrites it
          id: row.credits.id,
        };
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    readMany: async () => {
      try {
        const credits = await db
          .select()
          .from(Credit)
          .innerJoin(User, eq(Credit.user_id, User.id))
          .where(eq(Credit.course_id, 42069));
        // .limit(perPage)
        // .offset((page - 1) * perPage);
        return credits.map((item) => userCreditMap(item.credits, item.users));
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    update: async (
      inputFields: FormFields<CourseCreditFlat> & { id: string },
      session,
    ) => {
      try {
        // TODO add in auth. mutation for credit and user maybe tricky
        // const fields = await creditPolicy.writableFields(session, null);
        // const sanitized = sanitizeFields(row, fields);
        const { id, user_id, course_id, attended, ...userFields } =
          validate.userCreditUpdate.parse(inputFields);

        // two updates but in a transaction so they succeed or fail together
        const result = await db.transaction(async (tx) => {
          const [credit] = await tx
            .update(Credit)
            .set({ attended })
            .where(eq(Credit.id, id))
            .returning();
          if (!credit) throw new NotFoundError(`Credit ${id} not found`);

          const [user] = await tx
            .update(User)
            .set(userFields)
            .where(eq(User.id, user_id))
            .returning();
          if (!user) throw new NotFoundError(`User ${user_id} not found`);

          // return { ...credit, ...user };
          return userCreditMap(credit, user);
        });

        return result;
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
    delete: async (id, session) => {
      try {
        const validId = validate.id.parse(id);
        const [deleted] = await db
          .delete(Credit)
          .where(eq(Credit.id, validId))
          .returning();
        if (!deleted) throw new NotFoundError(`Credit ${id} not found`);

        const [user] = await db
          .select()
          .from(User)
          .where(eq(User.id, deleted.user_id))
          .limit(1);
        if (!user) throw new NotFoundError(`User not found`);

        return userCreditMap(deleted, user);
      } catch (e) {
        throwErrorsForCRUD(e);
      }
    },
  },
} satisfies CrudRegistry;
// } satisfies Record<string, CrudEntry>;

type CrudRegistry = {
  courseCredits: CrudEntry<CourseCreditFlat>;
  locations: CrudEntry<LocationSelect>;
  users: CrudEntry<UserSelect>;
  roles: CrudEntry<RoleSelect>;
  courses: CrudEntry<CourseSelect>;
  credits: CrudEntry<CreditSelect>;
  // ...
};
export type CrudRegistryType = keyof typeof crud;
