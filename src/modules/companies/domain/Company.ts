import type { CompanyStatus } from "@prisma/client";

export interface CompanyEntity {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  name: string;
}
