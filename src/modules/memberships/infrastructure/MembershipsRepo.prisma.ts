import { prisma } from "../../../config/prisma.js";
import { MembershipRole } from "@prisma/client";

export interface MembershipRecord {
  id: string;
  userId: string;
  companyId: string;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertMembership(
  userId: string,
  companyId: string,
  role: MembershipRole
): Promise<MembershipRecord> {
  const m = await prisma.membership.upsert({
    where: {
      userId_companyId: { userId, companyId },
    },
    create: { userId, companyId, role },
    update: { role },
  });
  return {
    id: m.id,
    userId: m.userId,
    companyId: m.companyId,
    role: m.role,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export async function removeMembership(membershipId: string, companyId: string): Promise<boolean> {
  const deleted = await prisma.membership.deleteMany({
    where: { id: membershipId, companyId },
  });
  return deleted.count > 0;
}

export async function findMembershipByIdAndCompany(
  membershipId: string,
  companyId: string
): Promise<MembershipRecord | null> {
  const m = await prisma.membership.findFirst({
    where: { id: membershipId, companyId },
  });
  if (!m) return null;
  return {
    id: m.id,
    userId: m.userId,
    companyId: m.companyId,
    role: m.role,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
