import type { Request, Response, NextFunction } from "express";
import { fail } from "../http/response.js";

const COMPANY_HEADER = "x-company-id";

export function requireCompany(req: Request, res: Response, next: NextFunction): void {
  const fromHeader = req.headers[COMPANY_HEADER] as string | undefined;
  const fromParam = req.params.companyId as string | undefined;
  const companyId = fromHeader?.trim() || fromParam?.trim();
  if (!companyId) {
    fail(res, "BAD_REQUEST", "Company context required: set x-company-id header or :companyId param", 400);
    return;
  }
  req.ctx = req.ctx ?? ({} as Request["ctx"]);
  req.ctx!.companyId = companyId;
  next();
}
