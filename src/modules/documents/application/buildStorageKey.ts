import type { DocumentType } from "@prisma/client";
import { randomUUID } from "crypto";

const EXT_BY_TYPE: Record<DocumentType, string> = {
  PDF: "pdf",
  IMAGE: "img", // we keep original extension in DB; for key use generic or derive from mime
  XML: "xml",
};

export function buildStorageKey(companyId: string, type: DocumentType, mimeType: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = type === "IMAGE" ? mimeToExt(mimeType) : EXT_BY_TYPE[type];
  const uuid = randomUUID();
  return `companies/${companyId}/${type}/${yyyy}/${mm}/${uuid}.${ext}`;
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] ?? "img";
}
