import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { fail } from "./response.js";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      fail(res, "VALIDATION_ERROR", "Invalid request body", 400, result.error.flatten());
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      fail(res, "VALIDATION_ERROR", "Invalid query params", 400, result.error.flatten());
      return;
    }
    req.query = result.data as Request["query"];
    next();
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      fail(res, "VALIDATION_ERROR", "Invalid path params", 400, result.error.flatten());
      return;
    }
    req.params = result.data;
    next();
  };
}
