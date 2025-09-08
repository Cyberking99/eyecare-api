// src/modules/users/users.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./users.controller";
const r = Router();

r.get("/profile", requireAuth, ctrl.getProfile);
r.put("/profile", requireAuth, ctrl.updateProfile);
r.delete("/account", requireAuth, ctrl.deleteAccount);

export default r;
