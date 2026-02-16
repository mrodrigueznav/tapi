import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "../../../shared/middleware/requireAuth.js";
import { requireUser } from "../../../shared/middleware/requireUser.js";
import { requireCompany } from "../../../shared/middleware/requireCompany.js";
import { requireMembership } from "../../../shared/middleware/requireMembership.js";
import { requireRole } from "../../../shared/middleware/requireRole.js";
import multer from "multer";
import { MembershipRole } from "@prisma/client";

const memoryStorage = multer.memoryStorage();
const xmlUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["text/xml", "application/xml"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: text/xml, application/xml"));
    }
  },
});

export function createPrefillRoutes(
  controller: { prefillXml: (req: Request, res: Response, next: NextFunction) => Promise<void> }
) {
  const router = Router();
  router.post(
    "/xml",
    requireAuth,
    requireUser,
    requireCompany,
    requireMembership,
    requireRole(MembershipRole.OPERATOR),
    xmlUpload.single("xml"),
    controller.prefillXml.bind(controller)
  );
  return router;
}
