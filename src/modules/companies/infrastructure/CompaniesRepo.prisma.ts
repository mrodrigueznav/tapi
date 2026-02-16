import { prisma } from "../../../config/prisma.js";
import type { CompanyEntity, CreateCompanyInput } from "../domain/Company.js";
import { CompanyStatus } from "@prisma/client";

export async function createCompany(input: CreateCompanyInput): Promise<CompanyEntity> {
  const company = await prisma.company.create({
    data: {
      name: input.name,
      status: CompanyStatus.ACTIVE,
    },
  });
  return {
    id: company.id,
    name: company.name,
    status: company.status,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

export async function listCompanies(): Promise<CompanyEntity[]> {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });
  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function findCompanyById(id: string): Promise<CompanyEntity | null> {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return null;
  return {
    id: company.id,
    name: company.name,
    status: company.status,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}
