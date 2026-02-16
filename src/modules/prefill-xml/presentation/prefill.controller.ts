import type { Request, Response, NextFunction } from "express";
import { ok, fail } from "../../../shared/http/response.js";
import type { PrefillFromXmlCommand } from "../application/useCases/PrefillFromXml.usecase.js";

export function createPrefillController(
  prefillFromXml: (cmd: PrefillFromXmlCommand) => Promise<{ fields: unknown; warnings: string[]; source: string }>
) {
  return {
    async prefillXml(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const product = req.body.product as PrefillFromXmlCommand["product"];
        const file = req.file;
        if (!file?.buffer) {
          fail(res, "VALIDATION_ERROR", "No XML file uploaded", 400);
          return;
        }
        const xmlContent = file.buffer.toString("utf-8");
        const result = await prefillFromXml({ product, xmlContent });
        ok(res, result);
      } catch (err) {
        next(err);
      }
    },
  };
}
