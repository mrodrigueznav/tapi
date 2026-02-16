import { prisma } from "../../../config/prisma.js";
import type { DocumentEntity } from "../domain/Document.js";
import type { CreateDocumentInput } from "../domain/ports/DocumentsRepo.js";
import { StorageProvider } from "@prisma/client";

export async function create(input: CreateDocumentInput): Promise<DocumentEntity> {
  const doc = await prisma.document.create({
    data: {
      companyId: input.companyId,
      uploadedByUserId: input.uploadedByUserId,
      type: input.type,
      provider: StorageProvider.SUPABASE,
      bucket: input.bucket,
      storageKey: input.storageKey,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      checksumSha256: input.checksumSha256,
    },
  });
  return {
    id: doc.id,
    companyId: doc.companyId,
    uploadedByUserId: doc.uploadedByUserId,
    type: doc.type,
    bucket: doc.bucket,
    storageKey: doc.storageKey,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    checksumSha256: doc.checksumSha256 ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findById(id: string): Promise<DocumentEntity | null> {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return null;
  return {
    id: doc.id,
    companyId: doc.companyId,
    uploadedByUserId: doc.uploadedByUserId,
    type: doc.type,
    bucket: doc.bucket,
    storageKey: doc.storageKey,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    checksumSha256: doc.checksumSha256 ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
