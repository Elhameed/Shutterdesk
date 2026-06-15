import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { captureException } from "../lib/monitoring.js";
import { logger } from "../lib/logger.js";

export type ApiErrorBody = {
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
};

export class AppError extends Error {
  statusCode: number;
  errors?: ApiErrorBody["errors"];

  constructor(
    message: string,
    statusCode = 500,
    errors?: ApiErrorBody["errors"],
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  void next;
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      message: error.message,
      statusCode: error.statusCode,
    };

    if (error.errors) {
      body.errors = error.errors;
    }

    res.status(error.statusCode).json(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "A record with this value already exists",
        statusCode: 409,
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ message: "Record not found", statusCode: 404 });
      return;
    }
  }

  logger.error("unhandled_error", {
    error: error instanceof Error ? error.message : String(error),
  });
  captureException(error);

  const body: ApiErrorBody = {
    message: "Internal server error",
    statusCode: 500,
  };

  res.status(500).json(body);
}
