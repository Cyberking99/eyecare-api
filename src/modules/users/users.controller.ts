import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
const prisma = new PrismaClient();

export const getProfile = async (req: AuthedRequest, res: Response) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.id }, select: {
    id: true, fullname: true, email: true, phone: true, age: true, eyeConditions: true, preferences: true, dateRegistered: true
  }});
  res.json(me);
};

export const updateProfile = async (req: AuthedRequest, res: Response) => {
  const { age, eyeConditions, preferences, fullname, phone } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { age, eyeConditions, preferences, fullname, phone },
  });
  res.json({ id: updated.id });
};

export const deleteAccount = async (req: AuthedRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.user!.id }, data: { deletedAt: new Date() }});
  res.json({ message: "Account scheduled for deletion" });
};