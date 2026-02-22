import { ZodError } from "astro:schema";
import { LibsqlError } from "@libsql/client";

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

export function errorHandlingOnSubmit(e: unknown) {
  let err: string | Record<string, any> | null = null;
  let status: number = 500;

  if (e instanceof ZodError) {
    status = 422;
    err = e.flatten();
  } else if (e instanceof NotFoundError) {
    status = 404;
    err = e.message;
  } else if (e instanceof ConflictError) {
    status = 409;
    err = e.message;
  } else if ( e instanceof LibsqlError && e.extendedCode === "SQLITE_CONSTRAINT_UNIQUE") {
    status = 409;
    err = e.message.replace("SQLITE_CONSTRAINT: UNIQUE constraint failed:", "Database has existing item of ->");
  } else {
    status = 500;
    const msg = typeof e === "string" ? e : String(e);
    err = "An unexpected error occurred " + msg;
  }

  return {
    err,
    status,
  };
}
