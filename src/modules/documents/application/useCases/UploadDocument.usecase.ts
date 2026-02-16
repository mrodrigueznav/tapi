import type { DocumentType } from "@prisma/client";
import type { StoragePort } from "../../domain/ports/StoragePort.js";
import type { DocumentsRepoPort } from "../../domain/ports/DocumentsRepo.js";
import type { UploadResult } from "../../domain/types.js";

export interface UploadDocumentCommand {
  companyId: string;
  uploadedByUserId: string;
  type: DocumentType;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  bucket: string;
  storageKey: string;
}

export function buildUploadDocument(
  storage: StoragePort,
  repo: DocumentsRepoPort
) {
  return async function uploadDocument(cmd: UploadDocumentCommand): Promise<UploadResult> {
    await storage.upload(cmd.bucket, cmd.storageKey, cmd.buffer, cmd.mimeType);
    const doc = await repo.create({
      companyId: cmd.companyId,
      uploadedByUserId: cmd.uploadedByUserId,
      type: cmd.type,
      bucket: cmd.bucket,
      storageKey: cmd.storageKey,
      originalName: cmd.originalName,
      mimeType: cmd.mimeType,
      size: cmd.buffer.length,
    });
    return {
      documentId: doc.id,
      storageKey: doc.storageKey,
      type: doc.type,
      originalName: doc.originalName,
      size: doc.size,
      mimeType: doc.mimeType,
    };
  };
}
