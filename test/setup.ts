// Run before any test file so env is valid when app is imported.
// Load .env first so DATABASE_URL (and other vars) from .env are used; then set test defaults only if unset.
import "dotenv/config";
process.env.NODE_ENV = "test";
process.env.TEST_AUTH_BYPASS = "true";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/tapi_test";
// Clerk SDK requires a valid publishable key format (pk_test_<base64hostname$>)
process.env.CLERK_PUBLISHABLE_KEY =
  process.env.CLERK_PUBLISHABLE_KEY ?? "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "sk_test_dummy";
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? "https://test.supabase.co";
process.env.SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ?? "test-secret-key";
