import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth.js";
import { requireUser } from "../../shared/middleware/requireUser.js";
import { getMe } from "./me.controller.js";

const router = Router();

router.get("/", requireAuth, requireUser, getMe);

export default router;
