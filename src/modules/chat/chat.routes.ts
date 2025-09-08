import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./chat.controller";

const r = Router();
r.post("/message", requireAuth, ctrl.sendMessage);
r.get("/history", requireAuth, ctrl.history);
r.delete("/conversation/:id", requireAuth, ctrl.deleteConversation);
export default r;
