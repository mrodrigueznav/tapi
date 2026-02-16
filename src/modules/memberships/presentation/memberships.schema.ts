import { z } from "zod";
import { MembershipRole } from "@prisma/client";

const roleEnum = z.nativeEnum(MembershipRole);

export const inviteOrUpsertMembershipSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().optional(),
  role: roleEnum,
});

export const companyIdParamSchema = z.object({ companyId: z.string().cuid() });
export const membershipIdParamSchema = z.object({ membershipId: z.string().cuid() });

export type InviteOrUpsertMembershipBody = z.infer<typeof inviteOrUpsertMembershipSchema>;
