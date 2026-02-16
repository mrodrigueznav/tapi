import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { fail } from "../http/response.js";
import { AppError } from "../errors/AppError.js";

export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.ctx?.auth?.clerkUserId) {
    fail(res, "UNAUTHORIZED", "Authentication required", 401);
    return;
  }
  try {
    let user = await prisma.user.findUnique({
      where: { clerkUserId: req.ctx.auth.clerkUserId },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: req.ctx.auth.clerkUserId,
          email: undefined,
          name: undefined,
        },
      });
    }
    req.ctx.user = { id: user.id, isSuperAdmin: user.isSuperAdmin };
    next();
  } catch (err) {
    next(err instanceof Error ? err : new AppError("INTERNAL_ERROR", "Failed to resolve user", 500));
  }
}
