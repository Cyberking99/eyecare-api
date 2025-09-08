// src/modules/scans/scans.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./scans.controller";

const r = Router();
r.post("/upload", requireAuth, ...ctrl.upload);
r.get("/:id", requireAuth, ctrl.getById);
r.get("/user/:userId", requireAuth, ctrl.listByUser);
r.delete("/:id", requireAuth, ctrl.remove);
export default r;
