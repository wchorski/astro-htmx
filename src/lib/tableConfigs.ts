import type { BaseRow, FieldConfig } from "@ty/FieldConfig";
import type { CrudRegistryType } from "./crudRegistry";

const { DATALIST_CITIES, DATALIST_STATES } = import.meta.env;

const userRequiredConfig = {
  id: {
    label: "ID",
    type: "number",
    required: true,
    readonly: true,
  },
  first_name: {
    label: "First Name",
    type: "text",
    required: true,
    placeholder: "John...",
  },
  last_name: {
    label: "Last Name",
    type: "text",
    required: true,
    placeholder: "Doe...",
  },
  middle_initial: {
    label: "Middle Int.",
    type: "text",
  },
  phone: {
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "123-123-1234",
  },
  email: {
    label: "Email",
    type: "email",
    required: true,
    placeholder: "john@mail.lan",
  },
  address1: {
    label: "Address",
    type: "text",
    required: true,
    placeholder: "123 West East St...",
  },
  address2: {
    label: "P.O. Box",
    type: "text",
  },
  city: {
    type: "text",
    required: true,
    placeholder: "Naperville...",
    datalist: DATALIST_CITIES?.split(",").map((city) => ({
      value: city,
      label: city,
    })),
  },
  state: {
    type: "text",
    required: true,
    placeholder: "Illinois...",
    datalist: DATALIST_STATES?.split(",").map((state) => ({
      value: state,
      label: state,
    })),
  },
  zip: {
    type: "number",
    required: true,
    placeholder: "50505...",
  },
} as FieldConfig<BaseRow>;

const userCreditsRequiredConfig = (courseId:string) =>({
  id: {
    label: "ID",
    type: "number",
    required: true,
    readonly: true,
  },
  userId: {
    label: "User ID",
    type: "number",
  },
  courseId: {
    label: "Course ID",
    type: "hidden",
    value: courseId
  },
  first_name: {
    label: "First Name",
    type: "text",

    placeholder: "Jane Doe...",
  },
  last_name: {
    label: "Last Name",
    type: "text",

    placeholder: "Jane Doe...",
  },
  middle_initial: {
    label: "Middle Init.",
    type: "text",
  },
  email: {
    label: "Email",
    type: "email",

    placeholder: "jane@example.com...",
    autocomplete: "email",
  },
  phone: {
    label: "Phone",
    type: "tel",

    autocomplete: "phone",
  },
  address1: {
    label: "Address",
    type: "text",
  },
  city: {
    label: "city",
    type: "text",
  },
  state: {
    label: "state",
    type: "text",
  },
  zip: {
    label: "zip",
    type: "number",
  },
  attended: {
    label: "attended",
    type: "checkbox",
  },
} as FieldConfig<BaseRow>)

export const tableConfigs = {
  users: {
    // all: memberAllConfig,
    required: userRequiredConfig,
  },
  course: {
    // all: courseAllConfig,
  },
  credits: {
    // all: creditAllConfig,
  },
  locations: {
    // all: creditAllConfig,
  },
  userCredits: {
    // all: creditAllConfig,
    required: userCreditsRequiredConfig
  },
} satisfies Record<
  CrudRegistryType,
  Partial<Record<"all" | "required", FieldConfig | ((arg: string) => FieldConfig)>>
>;
