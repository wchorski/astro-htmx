import type { JSX } from "astro/jsx-runtime";

type InputProps = JSX.IntrinsicElements["input"];
export type InputTypeAttr = InputProps["type"];

type BaseInputAttrs = Omit<HTMLAttributes<"input">, "value">;

export type FieldSlot = BaseInputAttrs & {
  label?: string;
  value?: string | number | boolean;
};
export type FieldConfig = Record<string, FieldSlot>;
