import { column, defineDb, defineTable } from "astro:db";

// TOOD add in permissions later

const Role = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    label: column.text(), // "admin", "staff", "readonly"
    description: column.text({ optional: true }),
    permissions: column.json({ default: [] }),
  },
  indexes: [{ on: ["label"], unique: true }],
});

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    // TODO auth
    roleId: column.number({
      references: () => Role.columns.id,
      optional: true,
    }),
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
  //? this is a composit unique constraint. meaning the combo must be unique
  // indexes: [{ on: ["id", "phone", "email"], unique: true }],
  indexes: [
    { on: ["phone"], unique: true },
    { on: ["email"], unique: true },
  ],
});

const Course = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    wpPostId: column.number({ optional: true }),
    subject: column.text(),
    description: column.text({ optional: true }),
    where: column.text({ optional: true }),
    date: column.date(),
    dateCivil: column.text(),
    locationId: column.number({ references: () => Location.columns.id }),
  },
  indexes: [{ on: ["wpPostId"], unique: true }],
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
  indexes: [{ on: ["name"], unique: true }],
});

const Credit = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => User.columns.id }),
    courseId: column.number({ references: () => Course.columns.id }),
    date: column.date(),
    // date: column.date({ default: NOW }),
    grade: column.text({ optional: true }),
    attended: column.boolean({ default: false }),
  },
  //? a member can not have more than one credit on any one course (avoid duplicates)
  indexes: [{ on: ["courseId", "userId"], unique: true }],
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Role,
    Location,
    User,
    Course,
    Credit,
  },
});
