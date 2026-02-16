import type { CorsOptions } from "cors";
import { env } from "./env.js";

/**
 * Returns true if origin matches pattern. Pattern may contain a single * as wildcard
 * (e.g. https://*.lovable.app matches https://abc.lovable.app).
 */
function originMatches(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  const idx = pattern.indexOf("*");
  if (idx === -1) return origin === pattern;
  const prefix = pattern.slice(0, idx);
  const suffix = pattern.slice(idx + 1);
  return origin.startsWith(prefix) && origin.endsWith(suffix) && origin.length >= prefix.length + suffix.length;
}

/**
 * Parsed CORS origins from env. Empty array means "allow *" when in dev; in prod empty means no CORS (restrict).
 */
function getCorsOrigins(): string[] | "*" {
  const raw = (env.CORS_ORIGINS ?? "").trim();
  if (raw === "") {
    return env.NODE_ENV === "production" ? [] : "*";
  }
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : (env.NODE_ENV === "production" ? [] : "*");
}

export function getCorsOptions(): CorsOptions {
  const origins = getCorsOrigins();
  return {
    origin:
      origins === "*"
        ? true
        : (origin, cb) => {
            if (!origin) {
              cb(null, true);
              return;
            }
            const allowed = origins as string[];
            const ok = allowed.some((p) => originMatches(origin, p));
            cb(null, ok);
          },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "x-company-id"],
    optionsSuccessStatus: 204,
  };
}
