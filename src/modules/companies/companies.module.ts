import { Router } from "express";
import companiesRoutes from "./presentation/companies.routes.js";

export function createCompaniesModule() {
  const router = Router();
  router.use("/", companiesRoutes);
  return { router };
}
