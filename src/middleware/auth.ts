import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/jwt";

export type AuthedRequest<P = any, ResB = any, ReqB = any, Q = any> = Request<P, ResB, ReqB, Q> & { user?: { id: string; email: string } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
