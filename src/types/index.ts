import type {
  ApiErrorBody,
  ApiFieldError,
  ApiUser,
  UserRole,
} from "@contracts/index.js";

export type { ApiFieldError, UserRole };

/** The API's error body. Named `ApiError` here for the existing call sites. */
export type ApiError = ApiErrorBody;

/** The authenticated user. The server calls this `ApiUser`. */
export type User = ApiUser;
