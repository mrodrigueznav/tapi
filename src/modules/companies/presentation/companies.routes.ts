import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/requireAuth.js";
import { requireUser } from "../../../shared/middleware/requireUser.js";
import { requireSuperAdmin } from "../../../shared/middleware/requireSuperAdmin.js";
import { validateBody } from "../../../shared/http/validate.js";
import { createCompanySchema } from "./companies.schema.js";
import { createCompany, listCompanies } from "./companies.controller.js";

const router = Router();

// SUPERADMIN only
router.post(
  "/",
  requireAuth,
  requireUser,
  requireSuperAdmin,
  validateBody(createCompanySchema),
  createCompany
);

router.get("/", requireAuth, requireUser, requireSuperAdmin, listCompanies);

export default router;
