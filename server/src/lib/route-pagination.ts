import type { Response } from "express";
import type { PaginatedResult } from "./pagination.js";

export function respondWithOptionalPagination<T>(
  res: Response,
  result: T[] | PaginatedResult<T>,
) {
  if (Array.isArray(result)) {
    res.json({ data: result });
    return;
  }

  res.json({ data: result.items, pagination: result.pagination });
}
