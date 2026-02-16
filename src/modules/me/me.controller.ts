import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { ok } from "../../shared/http/response.js";

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.ctx!.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { company: true },
        },
      },
    });
    if (!user) {
      next(new Error("User not found after requireUser"));
      return;
    }
    const data = {
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email ?? null,
        name: user.name ?? null,
        isSuperAdmin: user.isSuperAdmin,
      },
      companies: user.memberships.map((m) => ({
        companyId: m.companyId,
        name: m.company.name,
        role: m.role,
      })),
    };
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
