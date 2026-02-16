import type { Request, Response, NextFunction } from "express";
import { MembershipRole } from "@prisma/client";
import { fail } from "../http/response.js";

const ROLE_ORDER: Record<MembershipRole | "SUPERADMIN", number> = {
  VIEWER: 0,
  OPERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
  SUPERADMIN: 4,
};

export function requireRole(minRole: MembershipRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.ctx?.membership) {
      fail(res, "FORBIDDEN", "Membership required", 403);
      return;
    }
    const userRole = req.ctx.user?.isSuperAdmin ? "SUPERADMIN" : req.ctx.membership.role;
    const minLevel = ROLE_ORDER[minRole];
    const userLevel = ROLE_ORDER[userRole as keyof typeof ROLE_ORDER] ?? -1;
    if (userLevel < minLevel) {
      fail(res, "FORBIDDEN", `Insufficient role. Required: ${minRole} or higher`, 403);
      return;
    }
    next();
  };
}
