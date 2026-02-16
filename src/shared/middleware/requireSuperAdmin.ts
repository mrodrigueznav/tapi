import type { Request, Response, NextFunction } from "express";
import { fail } from "../http/response.js";

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.ctx?.user?.isSuperAdmin) {
    fail(res, "FORBIDDEN", "Superadmin access required", 403);
    return;
  }
  next();
}
