import { ZodError, type typeToFlattenedError } from "astro:schema";
import { LibsqlError } from "@libsql/client";

// --- Error Classes ---

export class ValidationError<T = any> extends Error {
  flattened: typeToFlattenedError<T, string>;
  constructor(flattened: typeToFlattenedError<T, string>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.flattened = flattened;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// --- For use in CRUD registry methods ---
// Catches low-level DB/zod errors and re-throws as domain errors
// TODO use only if statements in error handling. like the func below
export function throwErrorsForCRUD(e: unknown): never {
  if (
    e instanceof NotFoundError ||
    e instanceof ConflictError ||
    e instanceof ValidationError
  ) {
    throw e;
  }

  if (e instanceof ZodError) throw new ValidationError(e.flatten());

  if (
    e instanceof LibsqlError &&
    (e as LibsqlError).extendedCode === "SQLITE_CONSTRAINT_UNIQUE"
  ) {
    const match = (e as LibsqlError).message.match(
      /UNIQUE constraint failed: (\w+\.\w+)/,
    )?.[1];

    throw new ConflictError(
      match
        ? `Database Duplicate: Item with "${match}" already exists`
        : "A duplicate entry already exists",
    );
  }

  const msg = e instanceof Error ? e.message : String(e);
  throw new Error("An unexpected error occurred: " + msg);
}

// --- For use in partials ---
// Maps domain errors to { err, status } for the response

export function errorHandlingOnSubmit(e: unknown): {
  err: string | typeToFlattenedError<any, string>;
  status: number;
} {
  if (e instanceof ValidationError) {
    return { status: 422, err: e.flattened };
  }

  if (e instanceof NotFoundError) {
    return { status: 404, err: e.message };
  }

  if (e instanceof ConflictError) {
    return { status: 409, err: e.message };
  }

  const msg = e instanceof Error ? e.message : String(e);
  return { status: 500, err: "An unexpected error occurred: " + msg };
}
