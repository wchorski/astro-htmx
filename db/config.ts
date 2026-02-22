import { column, defineDb, defineTable } from "astro:db";

const Member = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    // asipId: column.number(),
    // regNum: column.number(),
    first_name: column.text(),
    last_name: column.text(),
    middle_initial: column.text({ optional: true }),
    phone: column.text(),
    email: column.text(),
    address1: column.text(),
    address2: column.text({ optional: true }),
    city: column.text(),
    // TODO validate in `/api/confirm-credit.ts` instead
    // state: column.text({ enum: ["Illinois", "Indiana", "Iowa"] }),
    state: column.text(),
    zip: column.number(),
  },
  indexes: [{ on: ["id", "phone", "email"], unique: true }],
});

const Course = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    subject: column.text(),
    description: column.text({ optional: true }),
    where: column.text({ optional: true }),
    date: column.date(),
    dateCivil: column.text(),
    locationId: column.number({ references: () => Location.columns.id }),
  },
  indexes: [{ on: ["id"], unique: true }],
});
const Location = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    address: column.text(),
    city: column.text(),
    state: column.text(),
    zip: column.number(),
    timezone: column.text(),
    description: column.text({ optional: true }),
  },
  indexes: [{ on: ["id"], unique: true }],
});

const Credit = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    memberId: column.number({ references: () => Member.columns.id }),
    courseId: column.number({ references: () => Course.columns.id }),
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
    Course,
    Location,
    Credit,
  },
});
