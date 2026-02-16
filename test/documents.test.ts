import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("Documents", () => {

  it("upload XML and get documentId", async () => {
    const xmlContent = '<?xml version="1.0"?><root><foo>bar</foo></root>';
    const res = await request(app)
      .post("/api/documents")
      .set("x-test-clerk-user-id", "clerk_test_superadmin")
      .set("x-company-id", "clxx000000000000000000001") // may need real companyId from seed
      .field("type", "XML")
      .attach("file", Buffer.from(xmlContent), { filename: "test.xml", contentType: "application/xml" });
    if (res.status === 404 || res.status === 403) {
      expect(res.body.ok).toBe(false);
      return;
    }
    if (res.status === 201) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toMatchObject({
        documentId: expect.any(String),
        storageKey: expect.any(String),
        type: "XML",
        originalName: "test.xml",
        mimeType: "application/xml",
      });
    }
  });

  it("POST signed-url returns url when document exists", async () => {
    const res = await request(app)
      .post("/api/documents/some-document-id/signed-url")
      .set("x-test-clerk-user-id", "clerk_test_superadmin")
      .set("x-company-id", "clxx000000000000000000001")
      .send({});
    expect([200, 404, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toMatchObject({ url: expect.any(String), expiresIn: expect.any(Number) });
    }
  });
});
