import type { Request, Response } from "express";
import { ok } from "../../../shared/http/response.js";

export function getHealth(_req: Request, res: Response): void {
  ok(res, { status: "ok", timestamp: new Date().toISOString() });
}
