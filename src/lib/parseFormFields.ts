// src/lib/parseFormFields.ts
import type { FieldConfig } from "@ty/FieldConfig";

type FieldValue = string | number | boolean | null;

export function parseFormFields(
  raw: FormData,
  headers: string[],
  config: FieldConfig,
): Record<string, FieldValue> {
  const fields: Record<string, FieldValue> = {};

  for (const key of headers) {
    const slot = config[key];
    const val = raw.get(key) as string;

    switch (slot?.type) {
      case "number":
        fields[key] = val === "" ? null : Number(val);
        break;
      case "checkbox":
        fields[key] = raw.has(key);
        break;
      case "date":
        // create real date object but only if timezone is present
        // fields[key] = DATE(val) ?? "";
      case "datetime-local":
        fields[key] = val ?? "";
        break;
      default:
        fields[key] = val ?? "";
        break;
    }
  }

  return fields;
}
