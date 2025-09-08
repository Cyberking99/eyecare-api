import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../services/jwt";
import { hashPassword, verifyPassword } from "../../utils/passwords";
// import crypto from "crypto";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { fullname, email, phone, password } = req.body;
  if (!fullname || !email || !phone || !password) return res.status(400).json({ message: "Missing fields" });
  if (phone) {
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return res.status(409).json({ message: "Phone already registered" });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { fullname, email, phone, passwordHash } });
  const access = signAccessToken({ id: user.id, email: user.email });
  const refresh = signRefreshToken({ id: user.id });
  await prisma.refreshToken.create({
    data: {
      token: refresh,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  return res.status(201).json({ id: user.id, user: { id: user.id, fullname, email, phone }, date_registered: user.dateRegistered, token: access, accessToken: access, refreshToken: refresh });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const access = signAccessToken({ id: user.id, email: user.email });
  const refresh = signRefreshToken({ id: user.id });

  // persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refresh,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  res.json({ token: access, user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }, accessToken: access, refreshToken: refresh });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbToken || dbToken.revokedAt) return res.status(401).json({ message: "Invalid token" });

  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    const access = signAccessToken({ id: payload.id });
    return res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ message: "Expired/invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revokedAt: new Date() } }).catch(() => {});
  }
  res.json({ message: "Logged out" });
};

// (Optional) password reset would create token email flow; store token hashed, TTL, verify, then set new password.
