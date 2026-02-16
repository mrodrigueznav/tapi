import { z } from "zod";
import { DocumentType } from "@prisma/client";

export const documentTypeSchema = z.nativeEnum(DocumentType);

export const signedUrlBodySchema = z.object({
  ttlSeconds: z.coerce.number().min(60).max(86400).optional(),
});

export const documentIdParamSchema = z.object({
  documentId: z.string().cuid(),
});
