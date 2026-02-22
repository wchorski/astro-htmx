// FieldConfig.d.ts
import type { HTMLAttributes } from "astro/types";
import type { JSX } from "astro/jsx-runtime";

type InputProps = JSX.IntrinsicElements["input"];
export type InputTypeAttr = InputProps["type"] | (string & {});

type BaseInputAttrs = Omit<HTMLAttributes<"input">, "value">;

export type FieldOption = {
  value: string | number;
  label: string;
};

type BaseFieldSlot = {
  label?: string;
  value?: string | number | boolean;
};


type InputFieldSlot = BaseFieldSlot &
BaseInputAttrs & {
  type?: InputTypeAttr;
  datalist?: FieldOption[];
};

type SelectFieldSlot = BaseFieldSlot &
Omit<HTMLAttributes<"select">, "value"> & {
  type: "select";
  options: FieldOption[];
};

type TextareaFieldSlot = BaseFieldSlot &
Omit<HTMLAttributes<"textarea">, "value"> & {
  type: "textarea";
};

export type FieldSlot = InputFieldSlot | SelectFieldSlot | TextareaFieldSlot;
export type FieldType = FieldSlot["type"];

export type BaseRow = Record<string, unknown> & { id: number };

export type FieldConfig<TRow extends BaseRow = BaseRow> = {
  [K in keyof TRow]?: FieldSlot;
};

export type FieldValue = string | number | boolean | Date | File | null;