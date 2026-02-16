import type { Request, Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response.js";
import * as InviteOrUpsert from "../application/useCases/InviteOrUpsertMembership.usecase.js";
import * as Remove from "../application/useCases/RemoveMembership.usecase.js";

export async function inviteOrUpsert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = req.ctx!.companyId;
    const body = req.body as InviteOrUpsert.InviteOrUpsertCommand;
    const membership = await InviteOrUpsert.inviteOrUpsertMembership({
      companyId,
      clerkUserId: body.clerkUserId,
      email: body.email,
      name: body.name,
      role: body.role,
    });
    ok(res, membership, 201);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = req.ctx!.companyId;
    const { membershipId } = req.params as { membershipId: string };
    await Remove.removeMembership({ companyId, membershipId });
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
