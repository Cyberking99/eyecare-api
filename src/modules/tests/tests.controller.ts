// src/modules/tests/tests.controller.ts
import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
const prisma = new PrismaClient();

type IdParams = { id: string };

type SaveResultBody = { templateId: string; rawData: any; score?: number; remarks?: string };

type SubmitParams = { sessionId: string };

type ByTypeParams = { type: string };

type ResultParams = { id: string };

export const saveResult = async (req: AuthedRequest<unknown, unknown, SaveResultBody>, res: Response) => {
  const { templateId, rawData, score, remarks } = req.body;
  const row = await prisma.eyeTestResult.create({
    data: { userId: req.user!.id, templateId, rawData, score, remarks }
  });
  res.status(201).json(row);
};

export const history = async (req: AuthedRequest, res: Response) => {
  const rows = await prisma.eyeTestResult.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { template: true }
  });
  console.log(rows);
  res.json(rows);
};

export const analytics = async (req: AuthedRequest, res: Response) => {
  // Example: average scores by test type
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT et."type", AVG(etr."score") AS avg_score
    FROM "EyeTestResult" etr
    JOIN "EyeTestTemplate" et ON etr."templateId" = et."id"
    WHERE etr."userId" = $1
    GROUP BY et."type"
  `, req.user!.id);

  // Convert Decimal type from AVG to a float for JSON serialization
  const results = rows.map(row => ({
    ...row,
    avg_score: row.avg_score ? parseFloat(row.avg_score.toString()) : null,
  }));

  res.json(results);
};

export const getTests = async (req: AuthedRequest, res: Response) => {
  const rows = await prisma.eyeTestTemplate.findMany();
  res.json(rows);
};

export const getTest = async (req: AuthedRequest<IdParams>, res: Response) => {
  const { id } = req.params;
  const row = await prisma.eyeTestTemplate.findUnique({ where: { id } });
  res.json(row);
};

export const getByType = async (req: AuthedRequest<ByTypeParams>, res: Response) => {
  const { type } = req.params;
  const rows = await prisma.eyeTestTemplate.findMany({ where: { type: type as any } });
  res.json(rows);
};

export const startTest = async (req: AuthedRequest<IdParams>, res: Response) => {
  const { id } = req.params;
  const row = await prisma.eyeTestTemplate.findUnique({ where: { id } });
  // Optionally create a server-side session record; for now return a pseudo session id
  res.json({ sessionId: id, template: row });
};

export const submit = async (req: AuthedRequest<SubmitParams, unknown, { answers: any[] }>, res: Response) => {
  const { sessionId } = req.params;
  const template = await prisma.eyeTestTemplate.findUnique({ where: { id: sessionId } });
  if (!template) return res.status(404).json({ message: "Test not found" });

  // Very basic scoring example: number of truthy answers
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const score = answers.filter((a) => (a?.correct === true || a?.visible === true || (typeof a?.value === 'number'))).length;

  const result = await prisma.eyeTestResult.create({
    data: {
      userId: req.user!.id,
      templateId: template.id,
      rawData: { answers },
      score,
      remarks: undefined,
    },
  });
  res.status(201).json(result);
};

export const progress = async (req: AuthedRequest<IdParams>, res: Response) => {
  const { id } = req.params;
  const row = await prisma.eyeTestTemplate.findUnique({ where: { id } });
  res.json(row);
};

export const progressSummary = async (req: AuthedRequest, res: Response) => {
  // Calculate overall test progress statistics for the user.
  const stats = await prisma.eyeTestResult.aggregate({
    where: { userId: req.user!.id },
    _count: {
      id: true,
    },
    _avg: {
      score: true,
    },
    _max: {
      createdAt: true,
    },
  });

  const progress = {
    totalTests: stats._count.id,
    averageScore: stats._avg.score || 0,
    lastTestDate: stats._max.createdAt?.toISOString() || undefined,
    improvementTrend: 'stable', // Placeholder for trend logic
  };

  res.json(progress);
};

export const getResult = async (req: AuthedRequest<ResultParams>, res: Response) => {
  const { id } = req.params;
  const row = await prisma.eyeTestResult.findUnique({ where: { id }, include: { template: true } });
  res.json(row);
};