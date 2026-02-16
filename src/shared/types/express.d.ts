import type { MembershipRole } from "@prisma/client";

export interface RequestContext {
  auth: { clerkUserId: string };
  user: { id: string; isSuperAdmin: boolean };
  companyId: string;
  membership: { id: string; role: MembershipRole };
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      ctx?: RequestContext;
    }
  }
}

export {};
