import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { fail } from "../http/response.js";
import { MembershipRole } from "@prisma/client";

export async function requireMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.ctx?.user || !req.ctx?.companyId) {
    fail(res, "FORBIDDEN", "User and company context required", 403);
    return;
  }
  if (req.ctx.user.isSuperAdmin) {
    req.ctx.membership = {
      id: "superadmin",
      role: "OWNER" as MembershipRole,
    };
    next();
    return;
  }
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: req.ctx.user.id,
        companyId: req.ctx.companyId,
      },
    },
  });
  if (!membership) {
    fail(res, "FORBIDDEN", "You do not have access to this company", 403);
    return;
  }
  req.ctx.membership = { id: membership.id, role: membership.role };
  next();
}
