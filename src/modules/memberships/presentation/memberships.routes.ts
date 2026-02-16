import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/requireAuth.js";
import { requireUser } from "../../../shared/middleware/requireUser.js";
import { requireCompany } from "../../../shared/middleware/requireCompany.js";
import { requireMembership } from "../../../shared/middleware/requireMembership.js";
import { requireRole } from "../../../shared/middleware/requireRole.js";
import { validateBody, validateParams } from "../../../shared/http/validate.js";
import {
  inviteOrUpsertMembershipSchema,
  companyIdParamSchema,
  membershipIdParamSchema,
} from "./memberships.schema.js";
import { inviteOrUpsert, remove } from "./memberships.controller.js";
import { MembershipRole } from "@prisma/client";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  requireUser,
  requireCompany,
  requireMembership,
  requireRole(MembershipRole.ADMIN),
  validateParams(companyIdParamSchema),
  validateBody(inviteOrUpsertMembershipSchema),
  inviteOrUpsert
);

router.delete(
  "/:membershipId",
  requireAuth,
  requireUser,
  requireCompany,
  requireMembership,
  requireRole(MembershipRole.ADMIN),
  validateParams(companyIdParamSchema.merge(membershipIdParamSchema)),
  remove
);

export default router;
