import type { Request, Response, NextFunction } from "express";
import { ok, fail } from "../../../shared/http/response.js";
import { env } from "../../../config/env.js";
import { SUPABASE_BUCKET } from "../../../config/supabase.js";
import { buildStorageKey } from "../application/buildStorageKey.js";
import { buildUploadDocument } from "../application/useCases/UploadDocument.usecase.js";
import { buildGetSignedUrl } from "../application/useCases/GetSignedUrl.usecase.js";
import type { StoragePort } from "../domain/ports/StoragePort.js";
import type { DocumentsRepoPort } from "../domain/ports/DocumentsRepo.js";

export function createDocumentsController(storage: StoragePort, documentsRepo: DocumentsRepoPort) {
  const uploadDocument = buildUploadDocument(storage, documentsRepo);
  const getSignedUrl = buildGetSignedUrl(storage, documentsRepo);

  return {
    async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const ctx = req.ctx!;
        const companyId = ctx.companyId;
        const type = req.body.type as "PDF" | "IMAGE" | "XML";
        const file = req.file;
        if (!file?.buffer) {
          fail(res, "VALIDATION_ERROR", "No file uploaded", 400);
          return;
        }
        const storageKey = buildStorageKey(companyId, type, file.mimetype);
        const result = await uploadDocument({
          companyId,
          uploadedByUserId: ctx.user.id,
          type,
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          bucket: SUPABASE_BUCKET,
          storageKey,
        });
        ok(res, result, 201);
      } catch (err) {
        next(err);
      }
    },

    async getSignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const ctx = req.ctx!;
        const documentId = req.params.documentId as string;
        const ttlSeconds = (req.body as { ttlSeconds?: number })?.ttlSeconds ?? env.SIGNED_URL_TTL_SECONDS;
        const result = await getSignedUrl({
          documentId,
          companyId: ctx.companyId,
          ttlSeconds,
        });
        ok(res, result);
      } catch (err) {
        next(err);
      }
    },
  };
}
