// src/modules/export/export.controller.ts
import { PrismaClient } from "@prisma/client";
import { AuthedRequest } from "../../middleware/auth";
import { Response } from "express";
import { Parser } from "json2csv";
const prisma = new PrismaClient();

export const exportTests = async (req: AuthedRequest, res: Response) => {
  const rows = await prisma.eyeTestResult.findMany({ where: { userId: req.user!.id } });
  if ((req.query.format || "csv") === "json") return res.json(rows);
  const parser = new Parser({ fields: ["id","templateId","score","remarks","createdAt"] });
  const csv = parser.parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment("eye_tests.csv");
  res.send(csv);
};
