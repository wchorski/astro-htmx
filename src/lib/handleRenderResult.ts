// lib/handleRenderResult.ts
import type { HttpMethod, RenderResult } from "@ty/Results";

export function handleResult<T>(opts: {
  error?: unknown;
  entity?: T | null | undefined;
  method: HttpMethod;
  emptyMessage: string;
}): RenderResult<T> {
  const { error, entity, method, emptyMessage } = opts;

  if (error && typeof error === "object" && "fieldErrors" in error) {
    return { kind: "field-error", errors: error };
  }

  if (error) {
    return {
      kind: "top-error",
      message: typeof error === "string" ? error : JSON.stringify(error),
    };
  }

  if (entity) {
    return {
      kind: "success",
      entity,
      method,
    };
  }

  return { kind: "top-error", message: emptyMessage };
}