import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function buildUserContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      age: true,
      eyeConditions: true,
    },
  });

  const recentTests = await prisma.eyeTestResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      score: true,
      remarks: true,
      template: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  const recentExercises = await prisma.exerciseCompletion.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      score: true,
      exercise: {
        select: {
          title: true,
        },
      },
    },
  });

  return {
    user,
    recentTests,
    recentExercises,
  };
}