import * as MembershipsRepo from "../../infrastructure/MembershipsRepo.prisma.js";
import { AppError } from "../../../../shared/errors/AppError.js";

export interface RemoveMembershipCommand {
  companyId: string;
  membershipId: string;
}

export async function removeMembership(cmd: RemoveMembershipCommand): Promise<void> {
  const removed = await MembershipsRepo.removeMembership(cmd.membershipId, cmd.companyId);
  if (!removed) {
    throw new AppError("NOT_FOUND", "Membership not found", 404);
  }
}
