import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("OpenAPI", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it("GET /openapi.json returns 200 and contains paths and securitySchemes", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    const body = res.body as { paths?: object; components?: { securitySchemes?: object } };
    expect(body).toHaveProperty("paths");
    expect(body.paths).toBeDefined();
    expect(Object.keys(body.paths as object).length).toBeGreaterThan(0);
    expect(body).toHaveProperty("components");
    expect((body.components as { securitySchemes?: object }).securitySchemes).toBeDefined();
    expect((body.components as { securitySchemes?: object }).securitySchemes).toHaveProperty("bearerAuth");
  });
});
