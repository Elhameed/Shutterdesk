import axios from "axios";
import type { ApiError, ApiFieldError } from "@/types";

/**
 * Whether the API said this resource does not exist.
 *
 * Several service methods used to `catch { return undefined }`, which collapsed
 * a 500, a network failure and a genuine 404 into the same answer — so during
 * an outage the UI confidently reported "not found". Callers that legitimately
 * treat a missing resource as `undefined` now check for it, and let everything
 * else propagate.
 */
export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

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
