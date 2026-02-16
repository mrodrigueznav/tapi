/**
 * OpenAPI 3 document for TAPI. Used by /openapi.json and Swagger UI at /docs.
 * All API responses follow: success { ok: true, data } | error { ok: false, error: { code, message, details? } }.
 */

export const openApiDocument = (basePath = "") => ({
  openapi: "3.0.3",
  info: {
    title: "TAPI – Internal API",
    version: "1.0.0",
    description:
      "Multi-tenant API with Clerk auth, RBAC per company, and document storage (Supabase). All endpoints return a consistent envelope: `{ ok: true, data }` or `{ ok: false, error: { code, message, details? } }`.",
  },
  servers: basePath ? [{ url: basePath }] : [],
  tags: [
    { name: "Health", description: "Liveness" },
    { name: "Me", description: "Current user and companies" },
    { name: "Companies", description: "Company management (superadmin)" },
    { name: "Memberships", description: "Company members" },
    { name: "Documents", description: "Upload and signed URLs" },
    { name: "Prefill", description: "XML prefill" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Clerk session or JWT. Send as: Authorization: Bearer <token>",
      },
    },
    parameters: {
      CompanyIdHeader: {
        name: "x-company-id",
        in: "header",
        required: true,
        description: "Company context (required for documents, prefill, memberships)",
        schema: { type: "string", example: "clxx000000000000000000001" },
      },
    },
    schemas: {
      EnvelopeSuccess: {
        type: "object",
        required: ["ok", "data"],
        properties: {
          ok: { type: "boolean", example: true },
          data: { type: "object", description: "Response payload" },
        },
      },
      EnvelopeError: {
        type: "object",
        required: ["ok", "error"],
        properties: {
          ok: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: [
                  "UNAUTHORIZED",
                  "FORBIDDEN",
                  "NOT_FOUND",
                  "VALIDATION_ERROR",
                  "FILE_INVALID",
                  "STORAGE_ERROR",
                  "INTERNAL_ERROR",
                ],
              },
              message: { type: "string" },
              details: { type: "object", description: "Optional validation/details" },
            },
          },
        },
      },
      MeUser: {
        type: "object",
        properties: {
          id: { type: "string", example: "cuid_user_xxx" },
          clerkUserId: { type: "string", example: "user_2xxx" },
          email: { type: "string", nullable: true },
          name: { type: "string", nullable: true },
          isSuperAdmin: { type: "boolean" },
        },
      },
      MeCompany: {
        type: "object",
        properties: {
          companyId: { type: "string" },
          name: { type: "string" },
          role: { type: "string", enum: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] },
        },
      },
      MeResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/MeUser" },
          companies: { type: "array", items: { $ref: "#/components/schemas/MeCompany" } },
        },
      },
      Company: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
        },
      },
      DocumentUploadResult: {
        type: "object",
        properties: {
          documentId: { type: "string" },
          key: { type: "string" },
          type: { type: "string", enum: ["PDF", "IMAGE", "XML"] },
        },
      },
      SignedUrlResult: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          expiresAt: { type: "string", format: "date-time" },
        },
      },
      PrefillResult: {
        type: "object",
        properties: {
          fields: { type: "object", description: "Extracted key-value fields" },
          warnings: { type: "array", items: { type: "string" } },
          source: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        operationId: "getHealth",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
                example: { ok: true, data: { status: "ok", timestamp: "2025-01-15T12:00:00.000Z" } },
              },
            },
          },
        },
      },
    },
    "/api/me": {
      get: {
        tags: ["Me"],
        summary: "Current user and companies",
        description:
          "Returns the authenticated user and list of companies they belong to with role. Use to select company and set x-company-id for subsequent requests.",
        operationId: "getMe",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User and companies",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/MeResponse" },
                  },
                },
                example: {
                  ok: true,
                  data: {
                    user: {
                      id: "cuid_xxx",
                      clerkUserId: "user_2xxx",
                      email: "user@example.com",
                      name: "Jane",
                      isSuperAdmin: false,
                    },
                    companies: [
                      { companyId: "clxx000000000000000000001", name: "Acme", role: "ADMIN" },
                      { companyId: "clxx000000000000000000002", name: "Beta", role: "OPERATOR" },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EnvelopeError" },
                example: {
                  ok: false,
                  error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization" },
                },
              },
            },
          },
        },
      },
    },
    "/api/companies": {
      get: {
        tags: ["Companies"],
        summary: "List companies (superadmin)",
        operationId: "listCompanies",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of companies",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        companies: { type: "array", items: { $ref: "#/components/schemas/Company" } },
                      },
                    },
                  },
                },
                example: {
                  ok: true,
                  data: {
                    companies: [
                      { id: "clxx000000000000000000001", name: "Acme", status: "ACTIVE" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Companies"],
        summary: "Create company (superadmin)",
        operationId: "createCompany",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", minLength: 1, maxLength: 255 } },
              },
              example: { name: "New Company Inc" },
            },
          },
        },
        responses: {
          "201": {
            description: "Company created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Company" },
                  },
                },
                example: {
                  ok: true,
                  data: { id: "clxx000000000000000000001", name: "New Company Inc", status: "ACTIVE" },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EnvelopeError" },
                example: {
                  ok: false,
                  error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid request body",
                    details: { fieldErrors: { name: ["Required"] } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/companies/{companyId}/memberships": {
      post: {
        tags: ["Memberships"],
        summary: "Invite or upsert membership",
        description: "Requires x-company-id header and ADMIN (or higher) in that company.",
        operationId: "inviteOrUpsertMembership",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/CompanyIdHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["clerkUserId", "role"],
                properties: {
                  clerkUserId: { type: "string" },
                  email: { type: "string", format: "email", nullable: true },
                  name: { type: "string", nullable: true },
                  role: { type: "string", enum: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] },
                },
              },
              example: {
                clerkUserId: "user_2xxx",
                email: "member@example.com",
                name: "Member Name",
                role: "OPERATOR",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Membership created/updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        userId: { type: "string" },
                        companyId: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Memberships"],
        summary: "Remove membership",
        operationId: "removeMembership",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/CompanyIdHeader" },
          { name: "membershipId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Membership removed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { type: "object", properties: { deleted: { type: "boolean", example: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/documents": {
      post: {
        tags: ["Documents"],
        summary: "Upload document",
        description:
          "Multipart form: field `type` (PDF | IMAGE | XML), field `file` (binary). Requires x-company-id header. Operator role or higher.",
        operationId: "uploadDocument",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/CompanyIdHeader" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["type", "file"],
                properties: {
                  type: { type: "string", enum: ["PDF", "IMAGE", "XML"] },
                  file: { type: "string", format: "binary", description: "File to upload" },
                },
              },
              example: {
                type: "XML",
                file: "(binary)",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Document uploaded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/DocumentUploadResult" },
                  },
                },
                example: {
                  ok: true,
                  data: {
                    documentId: "cuid_doc_xxx",
                    key: "company_xxx/XML/xxx.xml",
                    type: "XML",
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error (e.g. no file, invalid type)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EnvelopeError" },
              },
            },
          },
        },
      },
    },
    "/api/documents/{documentId}/signed-url": {
      post: {
        tags: ["Documents"],
        summary: "Get signed download URL",
        description:
          "Returns a time-limited signed URL for the document. Body may include optional `ttlSeconds` (60–86400). Requires x-company-id.",
        operationId: "getSignedUrl",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/CompanyIdHeader" },
          { name: "documentId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { ttlSeconds: { type: "integer", minimum: 60, maximum: 86400 } },
              },
              example: { ttlSeconds: 300 },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed URL",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/SignedUrlResult" },
                  },
                },
                example: {
                  ok: true,
                  data: {
                    url: "https://xxx.supabase.co/storage/v1/object/sign/...",
                    expiresAt: "2025-01-15T12:05:00.000Z",
                  },
                },
              },
            },
          },
          "404": {
            description: "Document not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EnvelopeError" },
              },
            },
          },
        },
      },
    },
    "/api/prefill/xml": {
      post: {
        tags: ["Prefill"],
        summary: "Prefill from XML",
        description:
          "Multipart form: field `xml` (XML file), optional `product` (IMSS | RCV | INFONAVIT). Requires x-company-id. Operator or higher.",
        operationId: "prefillXml",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/CompanyIdHeader" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["xml"],
                properties: {
                  xml: { type: "string", format: "binary", description: "XML file" },
                  product: { type: "string", enum: ["IMSS", "RCV", "INFONAVIT"] },
                },
              },
              example: {
                xml: "(binary)",
                product: "IMSS",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Prefill result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/PrefillResult" },
                  },
                },
                example: {
                  ok: true,
                  data: {
                    fields: { importeTotal: "1000.00", fechaDocumento: "2024-01-15" },
                    warnings: [],
                    source: "CFDI",
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error or no file",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EnvelopeError" },
              },
            },
          },
        },
      },
    },
  },
});

export type OpenApiDocument = ReturnType<typeof openApiDocument>;
