import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireUser } from "../../shared/middleware/requireUser.js";
import { requireCompany } from "../../shared/middleware/requireCompany.js";
import { requireMembership } from "../../shared/middleware/requireMembership.js";
import { requireRole } from "../../shared/middleware/requireRole.js";
import { validateBody, validateParams } from "../../shared/http/validate.js";
import { singleDocumentUpload, handleMulterError } from "../../shared/middleware/upload.js";
import { SupabaseStorageAdapter } from "./infrastructure/storage/SupabaseStorageAdapter.js";
import * as DocumentsRepo from "./infrastructure/DocumentsRepo.prisma.js";
import { createDocumentsController } from "./presentation/documents.controller.js";
import { signedUrlBodySchema, documentIdParamSchema } from "./presentation/documents.schema.js";
import { fail } from "../../shared/http/response.js";
import type { Request, Response, NextFunction } from "express";
import { MembershipRole } from "@prisma/client";

export interface DocumentsModule {
  router: Router;
  storage: SupabaseStorageAdapter;
  documentsRepo: { create: typeof DocumentsRepo.create; findById: typeof DocumentsRepo.findById };
}

export function createDocumentsModule(): DocumentsModule {
  const storage = new SupabaseStorageAdapter();
  const documentsRepo = { create: DocumentsRepo.create, findById: DocumentsRepo.findById };
  const controller = createDocumentsController(storage, documentsRepo);

  const router = Router();

  // POST /api/documents — multipart: type (PDF|IMAGE|XML), file. x-company-id required.
  router.post(
    "/",
    requireAuth,
    requireUser,
    requireCompany,
    requireMembership,
    requireRole(MembershipRole.OPERATOR),
    singleDocumentUpload("file"),
    (req: Request, res: Response, next: NextFunction): void => {
      const type = req.body.type as string | undefined;
      if (!type || !["PDF", "IMAGE", "XML"].includes(type)) {
        fail(res, "VALIDATION_ERROR", "body.type must be PDF, IMAGE, or XML", 400);
        return;
      }
      next();
    },
    handleMulterError,
    controller.upload.bind(controller)
  );

  // POST /api/documents/:documentId/signed-url
  router.post(
    "/:documentId/signed-url",
    requireAuth,
    requireUser,
    requireCompany,
    requireMembership,
    requireRole(MembershipRole.OPERATOR),
    validateParams(documentIdParamSchema),
    validateBody(signedUrlBodySchema.optional()),
    controller.getSignedUrl.bind(controller)
  );

  return { router, storage, documentsRepo };
}
