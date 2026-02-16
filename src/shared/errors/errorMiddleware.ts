import type { Request, Response, NextFunction } from "express";
import { isAppError } from "./AppError.js";
import { logger } from "../../config/logger.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details != null && { details: err.details }),
      },
    });
    return;
  }
  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
