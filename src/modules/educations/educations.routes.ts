// src/modules/exercises/exercises.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./educations.controller";
const r = Router();

r.get("/", requireAuth, ctrl.getEducations);

export default r;
