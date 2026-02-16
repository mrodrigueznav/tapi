import { Router } from "express";
import membershipsRoutes from "./presentation/memberships.routes.js";

export function createMembershipsModule() {
  const router = Router();
  router.use("/", membershipsRoutes);
  return { router };
}
