import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { env } from "../../config/env.js";
import { fail } from "../http/response.js";

const TEST_USER_HEADER = "x-test-clerk-user-id";
const DEFAULT_TEST_USER = "clerk_test_superadmin";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (env.NODE_ENV === "test" && env.TEST_AUTH_BYPASS) {
      const clerkUserId = (req.headers[TEST_USER_HEADER.toLowerCase()] as string) || DEFAULT_TEST_USER;
      req.ctx = req.ctx ?? ({} as Request["ctx"]);
      req.ctx!.auth = { clerkUserId };
      next();
      return;
    }
    const { userId } = getAuth(req);
    if (!userId) {
      fail(res, "UNAUTHORIZED", "Missing or invalid Authorization", 401);
      return;
    }
    req.ctx = req.ctx ?? ({} as Request["ctx"]);
    req.ctx!.auth = { clerkUserId: userId };
    next();
  } catch (err) {
    fail(res, "UNAUTHORIZED", "Invalid or expired token", 401);
  }
}
