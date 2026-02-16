import { Router, type Request } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

const router = Router();

/** GET /openapi.json — raw OpenAPI 3 document (no auth). */
router.get("/openapi.json", (req: Request, res) => {
  const basePath = req.protocol + "://" + req.get("host") || "";
  const doc = openApiDocument(basePath);
  res.setHeader("Content-Type", "application/json");
  res.json(doc);
});

/** GET /docs — Swagger UI (no auth). */
const doc = openApiDocument("");
router.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(doc, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TAPI – API Docs",
  })
);

export default router;
