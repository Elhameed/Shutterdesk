import type { Request } from "express";
import type { ZodType, output } from "zod";
import { formatZodErrors } from "../lib/format-zod-errors.js";
import { AppError } from "./error-handler.js";

/**
 * Parse part of a request, or fail with a 400 carrying per-field errors.
 *
 * This block was written out by hand in 31 places:
 *
 *   const parsed = schema.safeParse(req.body);
 *   if (!parsed.success) {
 *     throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
 *   }
 *
 * These are helpers rather than middleware on purpose. Adding a second handler
 * to a route moves Express onto a different overload, which widens `req.params`
 * values to `string | string[]` at every call site that reads one — so
 * validating inside the handler keeps both the boilerplate gone and the param
 * types intact, and the parsed value stays typed without a cast.
 */

// Generic over the schema rather than over a value type, so the result is the
// schema's *output*. Writing `ZodType<T>` infers T from the input side, which
// differs wherever a field uses `.default()` — there the value is optional going
// in and always present coming out.
function parse<S extends ZodType>(schema: S, value: unknown): output<S> {
  // `?? {}` so a request with no body validates against the schema's own
  // optionality rules rather than failing on undefined.
  const parsed = schema.safeParse(value ?? {});

  if (!parsed.success) {
    throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
  }

  return parsed.data;
}

export function parseBody<S extends ZodType>(req: Request, schema: S): output<S> {
  return parse(schema, req.body);
}

export function parseQuery<S extends ZodType>(req: Request, schema: S): output<S> {
  return parse(schema, req.query);
}
