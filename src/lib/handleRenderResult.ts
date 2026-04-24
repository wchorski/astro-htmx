import type { HttpMethod, RenderResult } from "@ty/RenderResults";

export function handleResult<T>(opts: {
  error?: unknown;
  entity?: T | null | undefined;
  method: string;          // Astro.request.method is string
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
      method: method as HttpMethod,
    };
  }

  return { kind: "top-error", message: emptyMessage };
}
``