import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { pinoHttp } from "pino-http";
import type { Request } from "express";
import { logger } from "./config/logger.js";
import { getCorsOptions } from "./config/cors.js";
import { requestIdMiddleware } from "./shared/middleware/requestId.js";
import { notFoundMiddleware } from "./shared/middleware/notFound.js";
import { errorMiddleware } from "./shared/errors/errorMiddleware.js";
import openApiRoutes from "./openapi.routes.js";
import healthRoutes from "./modules/health/presentation/health.routes.js";
import meRoutes from "./modules/me/me.routes.js";
import { createCompaniesModule } from "./modules/companies/companies.module.js";
import { createMembershipsModule } from "./modules/memberships/memberships.module.js";
import { createDocumentsModule } from "./modules/documents/documents.module.js";
import { createPrefillModule } from "./modules/prefill-xml/prefill.module.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(express.json());
  app.use(clerkMiddleware());
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req: Request & { id?: string }) => req.id ?? "",
    }) as express.RequestHandler
  );

  app.use(openApiRoutes);
  app.use("/health", healthRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/companies", createCompaniesModule().router);
  app.use("/api/companies/:companyId/memberships", createMembershipsModule().router);
  app.use("/api/documents", createDocumentsModule().router);
  app.use("/api/prefill", createPrefillModule().router);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
