import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: isTest ? z.string().optional().default("postgresql://localhost:5432/test") : z.string().min(1),
  CLERK_PUBLISHABLE_KEY: isTest
    ? z.string()
        .optional()
        .default("pk_test_Y2xlcmsuZXhhbXBsZS5jb20k")
    : z.string().min(1),
  CLERK_SECRET_KEY: isTest ? z.string().optional().default("sk_test_dummy") : z.string().min(1),
  SUPABASE_URL: isTest ? z.string().url().optional().default("https://test.supabase.co") : z.string().url(),
  SUPABASE_SECRET_KEY: isTest ? z.string().optional().default("test-secret-key") : z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default("documents"),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().min(60).default(300),
  /** Comma-separated origins for CORS. Empty in dev allows *; in prod restrict. Supports wildcards e.g. https://*.lovable.app */
  CORS_ORIGINS: z.string().optional().default(""),
  TEST_AUTH_BYPASS: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export type Env = z.infer<typeof envSchema>;

let parsed: Env;

try {
  parsed = envSchema.parse(process.env);
} catch (err) {
  const lines = err && typeof err === "object" && "flatten" in err
    ? (err as z.ZodError).flatten().fieldErrors
    : null;
  console.error("[env] Invalid environment variables. Check Azure App Settings.", lines ?? err);
  process.exit(1);
}

export const env = parsed;
