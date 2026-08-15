import axios from "axios";
import type { ApiError } from "@/types";

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
