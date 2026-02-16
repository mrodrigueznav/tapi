import type { StoragePort } from "../../domain/ports/StoragePort.js";
import type { DocumentsRepoPort } from "../../domain/ports/DocumentsRepo.js";
import { AppError } from "../../../../shared/errors/AppError.js";

export interface GetSignedUrlCommand {
  documentId: string;
  companyId: string; // from context, to validate ownership
  ttlSeconds: number;
}

export interface SignedUrlResult {
  url: string;
  expiresIn: number;
}

export function buildGetSignedUrl(storage: StoragePort, repo: DocumentsRepoPort) {
  return async function getSignedUrl(cmd: GetSignedUrlCommand): Promise<SignedUrlResult> {
    const doc = await repo.findById(cmd.documentId);
    if (!doc) throw new AppError("NOT_FOUND", "Document not found", 404);
    if (doc.companyId !== cmd.companyId) {
      throw new AppError("FORBIDDEN", "Document does not belong to this company", 403);
    }
    const url = await storage.createSignedUrl(doc.bucket, doc.storageKey, cmd.ttlSeconds);
    return { url, expiresIn: cmd.ttlSeconds };
  };
}
