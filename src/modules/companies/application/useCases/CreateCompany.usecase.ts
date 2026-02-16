import type { CompanyEntity } from "../../domain/Company.js";
import * as CompaniesRepo from "../../infrastructure/CompaniesRepo.prisma.js";

export interface CreateCompanyCommand {
  name: string;
}

export async function createCompany(cmd: CreateCompanyCommand): Promise<CompanyEntity> {
  return CompaniesRepo.createCompany({ name: cmd.name });
}
