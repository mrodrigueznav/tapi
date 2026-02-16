import type { Request, Response } from "express";
import { fail } from "../http/response.js";

export function notFoundMiddleware(_req: Request, res: Response): void {
  fail(res, "NOT_FOUND", "Resource not found", 404);
}
