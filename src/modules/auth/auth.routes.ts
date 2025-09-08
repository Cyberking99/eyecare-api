import { Router } from "express";
import * as ctrl from "./auth.controller";
const r = Router();

r.post("/register", ctrl.register);
r.post("/login", ctrl.login);
r.post("/refresh", ctrl.refresh);
r.post("/logout", ctrl.logout);

export default r;
