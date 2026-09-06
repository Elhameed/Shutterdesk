import axios from "axios";
import type { ApiError, ApiFieldError } from "@/types";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getQueryErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  return getApiErrorMessage(error, fallback);
}

/**
 * Per-field validation failures from the API, keyed by field name.
 *
 * Every zod-guarded route already returns these; forms can map them onto their
 * inputs instead of showing one generic message for the whole submission.
 */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const data = error.response?.data as ApiError | undefined;
  if (!Array.isArray(data?.errors)) {
    return {};
  }

  return data.errors.reduce<Record<string, string>>((fields, item) => {
    const { field, message } = item as ApiFieldError;
    // First message wins — a field with several failures shows the first,
    // which is the one zod reports as most specific.
    if (field && message && !(field in fields)) {
      fields[field] = message;
    }
    return fields;
  }, {});
}
