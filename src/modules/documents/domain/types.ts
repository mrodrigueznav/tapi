import type { DocumentType } from "@prisma/client";

export interface DocumentMetadata {
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

export interface UploadResult {
  documentId: string;
  storageKey: string;
  type: DocumentType;
  originalName: string;
  size: number;
  mimeType: string;
}
