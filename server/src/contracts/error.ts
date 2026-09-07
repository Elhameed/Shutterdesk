/**
 * One field-level validation failure, as produced by `formatZodErrors`.
 *
 * The API has always returned these — 44 route handlers build them — but the
 * client's copy of the error type never declared the array, so every form in
 * the app collapsed a detailed validation response into a single generic
 * banner. Declaring it once is what makes that recoverable.
 */
export type ApiFieldError = {
  field: string;
  message: string;
};

/** The body of every non-2xx response, from `AppError` via the error handler. */
export type ApiErrorBody = {
  message: string;
  statusCode: number;
  errors?: ApiFieldError[];
};
