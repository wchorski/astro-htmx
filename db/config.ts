import { column, defineDb, defineTable } from "astro:db";

const Member = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    asipId: column.number(),
    regNum: column.number(),
    first_name: column.text(),
    last_name: column.text(),
    middle_initial: column.text({ optional: true }),
    phone: column.text(),
    email: column.text(),
    address1: column.text(),
    address2: column.text({ optional: true }),
    city: column.text(),
    state: column.text({ enum: ["Illinois", "Indiana", "Iowa"] }),
    zip: column.number(),
  },
  indexes: [{ on: ["id", "asipId", "regNum"], unique: true }],
});

const Class = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    subject: column.text(),
    description: column.text({ optional: true }),
    date: column.date(),
  },
  indexes: [{ on: ["id"], unique: true }],
});

const Credit = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    memberId: column.number({ references: () => Member.columns.id }),
    classId: column.number({ references: () => Class.columns.id }),
    date: column.date(),
    // date: column.date({ default: NOW }),
    grade: column.text({ optional: true }),
    attended: column.boolean(),
  },
  indexes: [{ on: ["id"], unique: true }],
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Member,
    Class,
    Credit,
  },
});
