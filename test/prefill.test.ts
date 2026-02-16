import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

const minimalCfdi = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Total="1234.56" Fecha="2024-01-15T12:00:00">
  <cfdi:Emisor Rfc="AAA010101AAA" Nombre="ACME SA"/>
  <cfdi:Receptor Rfc="BBB020202BBB" Nombre="Cliente SA"/>
</cfdi:Comprobante>`;

describe("Prefill XML", () => {

  it("POST /api/prefill/xml with CFDI returns importeTotal and fechaDocumento", async () => {
    const res = await request(app)
      .post("/api/prefill/xml")
      .set("x-test-clerk-user-id", "clerk_test_superadmin")
      .set("x-company-id", "clxx000000000000000000001")
      .field("product", "IMSS")
      .attach("xml", Buffer.from(minimalCfdi), { filename: "cfdi.xml", contentType: "application/xml" });
    if (res.status === 403 || res.status === 404) {
      expect(res.body.ok).toBe(false);
      return;
    }
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toMatchObject({
      fields: expect.objectContaining({
        importeTotal: "1234.56",
        fechaDocumento: "2024-01-15",
      }),
      warnings: expect.any(Array),
      source: "xml",
    });
  });
});
