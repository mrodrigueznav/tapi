import type { Request, Response, NextFunction } from "express";
import { ok } from "../../../shared/http/response.js";
import * as CreateCompany from "../application/useCases/CreateCompany.usecase.js";
import * as CompaniesRepo from "../infrastructure/CompaniesRepo.prisma.js";

export async function createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { name: string };
    const company = await CreateCompany.createCompany({ name: body.name });
    ok(res, company, 201);
  } catch (err) {
    next(err);
  }
}

export async function listCompanies(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companies = await CompaniesRepo.listCompanies();
    ok(res, { companies });
  } catch (err) {
    next(err);
  }
}
