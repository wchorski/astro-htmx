// src/lib/tableDbRegistry.ts
import type { TableRow } from "@ty/Table";
import { db, Member, Credit } from "astro:db";

type CreateFn = (row: Omit<TableRow, "id">) => Promise<TableRow>;
type ReadFn = (id: number) => Promise<TableRow | null>;
type UpdateFn = (row: Partial<TableRow> & { id: number }) => Promise<TableRow>;
type DeleteFn = (id: number) => Promise<void>;

type CrudEntry = {
  create: CreateFn;
  read: ReadFn;
  update: UpdateFn;
  delete: DeleteFn;
};

export const crudRegistry = {
  members: {
    create: async (row) => {
      const [newMember] = await db.insert(Member).values(row).returning();
      return newMember;
    },
    read: async (id) =>
      await db.select().from(Member).where(eq(Member.id, id)).get(),
    update: async (row) => {
      const { id, ...fields } = row;
      const result = await db
        .update(Member)
        .set(fields)
        .where(eq(Member.id, id))
        .returning();
      return result[0];
    },
    delete: async (id) => {
      await db.delete(Member).where(eq(Member.id, id));
    },
  },

  credits: {
    create: async (row) => {
      const result = await db.insert(Credit).values(row).returning();
      return result[0];
    },
    read: async (id) =>
      await db.select().from(Credit).where(eq(Credit.id, id)).get(),
    update: async (row) => {
      const { id, ...fields } = row;
      const result = await db
        .update(Credit)
        .set(fields)
        .where(eq(Credit.id, id))
        .returning();
      return result[0];
    },
    delete: async (id) => {
      await db.delete(Credit).where(eq(Credit.id, id));
    },
  },
} satisfies Record<string, CrudEntry>;

export type CrudRegistryType = keyof typeof crudRegistry;
