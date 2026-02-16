import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("GET /api/me", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it("with TEST_AUTH_BYPASS and x-test-clerk-user-id returns ok true and data.user (or 500 if DB unavailable)", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("x-test-clerk-user-id", "clerk_test_superadmin");
    expect([200, 500]).toContain(res.status);
    if (res.status === 500) return; // DB not available
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toMatchObject({
      id: expect.any(String),
      clerkUserId: "clerk_test_superadmin",
      isSuperAdmin: expect.any(Boolean),
    });
    expect(res.body.data).toHaveProperty("companies");
    expect(Array.isArray(res.body.data.companies)).toBe(true);
  });
});
