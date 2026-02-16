import { prisma } from "../../../../config/prisma.js";
import type { MembershipRecord } from "../../infrastructure/MembershipsRepo.prisma.js";
import * as MembershipsRepo from "../../infrastructure/MembershipsRepo.prisma.js";
import { AppError } from "../../../../shared/errors/AppError.js";

export interface InviteOrUpsertCommand {
  companyId: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  role: MembershipRecord["role"];
}

export async function inviteOrUpsertMembership(cmd: InviteOrUpsertCommand): Promise<MembershipRecord> {
  let user = await prisma.user.findUnique({
    where: { clerkUserId: cmd.clerkUserId },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkUserId: cmd.clerkUserId,
        email: cmd.email || undefined,
        name: cmd.name || undefined,
      },
    });
  } else if (cmd.email !== undefined || cmd.name !== undefined) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(cmd.email !== undefined && { email: cmd.email || null }),
        ...(cmd.name !== undefined && { name: cmd.name || null }),
      },
    });
  }
  const company = await prisma.company.findUnique({ where: { id: cmd.companyId } });
  if (!company) {
    throw new AppError("NOT_FOUND", "Company not found", 404);
  }
  return MembershipsRepo.upsertMembership(user.id, cmd.companyId, cmd.role);
}
