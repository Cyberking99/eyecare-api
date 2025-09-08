// src/modules/exercises/exercises.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./exercises.controller";
const r = Router();

r.get("/", requireAuth, ctrl.getExercises);
r.get("/history", requireAuth, ctrl.history);
r.get("/recommendations", requireAuth, ctrl.recommendations);
r.get("/progress", requireAuth, ctrl.progress);
r.get("/:id", requireAuth, ctrl.getExercise);
r.get("/type/:type", requireAuth, ctrl.getByType);

r.post("/start/:id", requireAuth, ctrl.startExercise);
r.post("/complete/:sessionId", requireAuth, ctrl.completeBySession);

export default r;
