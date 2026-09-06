import type { ZodType, output } from "zod";

/**
 * Read a Prisma `Json` column through a schema.
 *
 * The schema layer has 24 untyped `Json` columns, and every read of one was a
 * hand-written ladder of `typeof stored.x === "string" ? stored.x : default`
 * checks — fifty lines of them for gallery settings alone. Zod was already a
 * dependency, used for env and request bodies but never for the columns that
 * most needed it.
 *
 * A read must never throw: these columns hold whatever an older version of the
 * app wrote, so a shape that no longer parses has to degrade to defaults rather
 * than take down the request. Give every schema a `.catch()` or use
 * `readJsonColumn`, which applies the fallback for you.
 */
export function readJsonColumn<S extends ZodType>(
  schema: S,
  value: unknown,
  fallback: output<S>,
): output<S> {
  const parsed = schema.safeParse(value ?? {});
  return parsed.success ? parsed.data : fallback;
}
