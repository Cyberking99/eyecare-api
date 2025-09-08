// src/modules/exercises/exercises.controller.ts
import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
const prisma = new PrismaClient();

// Admin CRUD could be protected by role (not shown).
export const complete = async (req: AuthedRequest, res: Response) => {
  const { exerciseId, durationSec, score } = req.body;
  const row = await prisma.exerciseCompletion.create({
    data: { userId: req.user!.id, exerciseId, durationSec, score }
  });
  res.status(201).json(row);
};

export const recommendations = async (req: AuthedRequest, res: Response) => {
  // naive: return top tagged exercises based on conditions
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const tags = (user?.eyeConditions || []).map(c => c.toLowerCase());
  const items = await prisma.exercise.findMany({ where: { OR: tags.map(t => ({ tags: { has: t } })) }, take: 10 });
  res.json(items);
};

// Helper function to calculate streak
const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  // Get unique days, sorted descending
  const uniqueDays = Array.from(new Set(dates.map(d => d.toISOString().split('T')[0])))
    .map(dStr => new Date(dStr))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  const firstDay = uniqueDays[0];

  // Check if the most recent completion is today or yesterday to be part of a current streak
  if (firstDay.getTime() === today.getTime() || firstDay.getTime() === yesterday.getTime()) {
    streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const current = uniqueDays[i];
      const next = uniqueDays[i+1];
      
      const diffDays = (current.getTime() - next.getTime()) / (1000 * 3600 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
  }

  return streak;
};

export const progress = async (req: AuthedRequest, res: Response) => {
  const completions = await prisma.exerciseCompletion.findMany({
    where: { userId: req.user!.id },
    orderBy: { completedAt: 'desc' },
  });

  const totalSessions = completions.length;
  const totalDurationSec = completions.reduce((sum, c) => sum + (c.durationSec || 0), 0);
  const validScores = completions.filter(c => typeof c.score === 'number');
  const averageScore = validScores.length > 0
    ? validScores.reduce((sum, c) => sum + (c.score || 0), 0) / validScores.length
    : 0;

  const streak = calculateStreak(completions.map(c => c.completedAt));

  res.json({
    totalSessions,
    totalDuration: Math.round(totalDurationSec / 60), // in minutes
    averageScore,
    lastCompleted: completions[0]?.completedAt.toISOString(),
    streak,
  });
};

export const getExercises = async (req: AuthedRequest, res: Response) => {
  const exercises = await prisma.exercise.findMany();
  res.json(exercises);
};

export const getExercise = async (req: AuthedRequest<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  res.json(exercise);
};

export const getByType = async (req: AuthedRequest<{ type: string }>, res: Response) => {
  const { type } = req.params;
  const items = await prisma.exercise.findMany({ where: { config: { path: ["type"], equals: type } } as any });
  res.json(items);
};

export const startExercise = async (req: AuthedRequest<{ id: string }>, res: Response) => {
  const { id } = req.params;
  // In a simple flow, use exercise id as session id
  res.json({ id: `${id}:session`, exerciseId: id, userId: req.user!.id, completedAt: new Date().toISOString(), duration: 0 });
};

export const completeBySession = async (req: AuthedRequest<{ sessionId: string }, unknown, { durationSec: number; score?: number; notes?: string }>, res: Response) => {
  const { sessionId } = req.params;
  const exerciseId = sessionId.split(":")[0];
  const row = await prisma.exerciseCompletion.create({
    data: {
      userId: req.user!.id,
      exerciseId,
      durationSec: req.body?.durationSec || 0,
      score: req.body?.score,
      // notes are not saved in this simple flow
    },
  });
  res.status(201).json({ id: row.id, exerciseId: row.exerciseId, userId: row.userId, completedAt: row.completedAt.toISOString(), duration: (row.durationSec || 0) / 60, score: row.score, notes: req.body.notes });
};

export const history = async (req: AuthedRequest, res: Response) => {
  const rows = await prisma.exerciseCompletion.findMany({
    where: { userId: req.user!.id },
    orderBy: { completedAt: "desc" },
  });
  res.json(rows.map(r => ({ id: r.id, exerciseId: r.exerciseId, userId: r.userId, completedAt: r.completedAt, duration: (r.durationSec || 0) / 60, score: r.score })));
};
