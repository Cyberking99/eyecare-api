// src/modules/export/export.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { exportTests } from "./export.controller";
const r = Router();
r.get("/tests", requireAuth, exportTests);
export default r;
