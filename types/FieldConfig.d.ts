import type { HTMLAttributes } from "astro/types";
import type { JSX } from "astro/jsx-runtime";

type InputProps = JSX.IntrinsicElements["input"];
export type InputTypeAttr = InputProps["type"] | (string & {});

type BaseInputAttrs = Omit<HTMLAttributes<"input">, "value">;

export type FieldSlot = BaseInputAttrs & {
  label?: string;
  value?: string | number | boolean;
};

// Row must always have an id
export type BaseRow = Record<string, unknown> & { id: number };

// Keys are constrained to the row shape, all optional
export type FieldConfig<TRow extends BaseRow = BaseRow> = {
  [K in keyof TRow]?: FieldSlot;
};