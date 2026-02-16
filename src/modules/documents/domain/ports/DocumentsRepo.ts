import type { DocumentEntity } from "../Document.js";
import type { DocumentType } from "@prisma/client";

export interface CreateDocumentInput {
  companyId: string;
  uploadedByUserId: string;
  type: DocumentType;
  bucket: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksumSha256?: string;
}

export interface DocumentsRepoPort {
  create(input: CreateDocumentInput): Promise<DocumentEntity>;
  findById(id: string): Promise<DocumentEntity | null>;
}
