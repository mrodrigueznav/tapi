import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { fail } from "../http/response.js";
import type { DocumentType } from "@prisma/client";

const BYTES = {
  XML: 5 * 1024 * 1024,   // 5MB
  PDF: 10 * 1024 * 1024,  // 10MB
  IMAGE: 10 * 1024 * 1024, // 10MB
};

const MIME_BY_TYPE: Record<DocumentType, string[]> = {
  PDF: ["application/pdf"],
  IMAGE: ["image/jpeg", "image/png", "image/webp"],
  XML: ["text/xml", "application/xml"],
};

const memoryStorage = multer.memoryStorage();

function makeFilter(allowedTypes: DocumentType[]) {
  const allowedMimes = allowedTypes.flatMap((t) => MIME_BY_TYPE[t]);
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(", ")}`));
      return;
    }
    cb(null, true);
  };
}

export function documentUploadMiddleware() {
  const allowed: DocumentType[] = ["PDF", "IMAGE", "XML"];
  const maxSize = Math.max(...allowed.map((t) => BYTES[t]));
  return multer({
    storage: memoryStorage,
    limits: { fileSize: maxSize },
    fileFilter: makeFilter(allowed),
  });
}

export function singleDocumentUpload(fieldName = "file") {
  const upload = documentUploadMiddleware();
  return upload.single(fieldName);
}

export function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      fail(res, "VALIDATION_ERROR", "File too large", 400);
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      fail(res, "VALIDATION_ERROR", "Unexpected file field", 400);
      return;
    }
  }
  if (err instanceof Error) {
    fail(res, "VALIDATION_ERROR", err.message, 400);
    return;
  }
  next(err);
}

export const UPLOAD_LIMITS = BYTES;
export const MIME_TYPES = MIME_BY_TYPE;
