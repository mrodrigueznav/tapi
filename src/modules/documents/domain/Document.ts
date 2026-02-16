import type { DocumentType } from "@prisma/client";

export interface DocumentEntity {
  id: string;
  companyId: string;
  uploadedByUserId: string;
  type: DocumentType;
  bucket: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksumSha256?: string;
  createdAt: Date;
  updatedAt: Date;
}
