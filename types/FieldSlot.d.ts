type BaseInputAttrs = Omit<HTMLAttributes<"input">, "value">;

export type FieldSlot = BaseInputAttrs

// TODO if i want to refine input attributes
// export type FieldSlot = BaseInputAttrs & {
//   label?: string;
//   value?: string | number | boolean;
// };