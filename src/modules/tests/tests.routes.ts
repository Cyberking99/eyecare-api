// src/modules/tests/tests.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./tests.controller";
const r = Router();

r.get("/", requireAuth, ctrl.getTests);
// Added endpoints to match mobile app
r.get("/history", requireAuth, ctrl.history);
r.get("/analytics", requireAuth, ctrl.analytics);
r.post("/result", requireAuth, ctrl.saveResult);

// Mobile app expects /tests/progress (summary)
r.get("/progress", requireAuth, ctrl.progressSummary);

r.get("/:id", requireAuth, ctrl.getTest);
r.get("/type/:type", requireAuth, ctrl.getByType);

r.post("/start/:id", requireAuth, ctrl.startTest);
// Mobile app submits to /tests/submit/:sessionId
r.post("/submit/:sessionId", requireAuth, ctrl.submit);

// Keep existing progress by id (if needed)
r.get("/progress/:id", requireAuth, ctrl.progress);

r.get("/result/:id", requireAuth, ctrl.getResult);

export default r;
