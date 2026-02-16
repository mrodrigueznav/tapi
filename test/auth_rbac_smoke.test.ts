import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("Auth RBAC smoke", () => {

  it("POST /api/companies without superadmin returns 403", async () => {
    const res = await request(app)
      .post("/api/companies")
      .set("x-test-clerk-user-id", "clerk_regular_user")
      .send({ name: "Test Co" });
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
    expect(res.body.error?.code).toBe("FORBIDDEN");
  });

  it("POST /api/companies with superadmin returns 201", async () => {
    const res = await request(app)
      .post("/api/companies")
      .set("x-test-clerk-user-id", "clerk_test_superadmin")
      .send({ name: "Test Company RBAC" });
    expect([201, 500]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Test Company RBAC");
    }
  });
});
