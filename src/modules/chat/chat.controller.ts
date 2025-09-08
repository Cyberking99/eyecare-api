import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
import { chatCompletion } from "../../services/openai";
import { buildUserContext } from "../../services/recommender";

const prisma = new PrismaClient();

export const sendMessage = async (req: AuthedRequest, res: Response) => {
  const { message: content, conversationId } = req.body;

  const conv = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId } })
    : await prisma.conversation.create({ data: { userId: req.user!.id, title: "AI EyeCare Chat" } });

  await prisma.chatMessage.create({
    data: { conversationId: conv!.id, userId: req.user!.id, role: "user", content }
  });

  const history = await prisma.chatMessage.findMany({
    where: { conversationId: conv!.id }, orderBy: { createdAt: "asc" }, take: 20
  });

  const context = await buildUserContext(req.user!.id);

  const system = {
    role: "system" as const,
    content:
`You are AIEyeCare, an assistant for eye health. Provide educational, non-diagnostic guidance. 
Use simple language. If symptoms sound serious, suggest seeing an optometrist/ophthalmologist. 
User context: ${JSON.stringify(context)}`
  };

  const messages = [system, ...history.map(m => ({ role: m.role as any, content: m.content })), { role: "user" as const, content }];
  const replyContent = await chatCompletion(messages);

  const assistantMessage = await prisma.chatMessage.create({
    data: { conversationId: conv!.id, role: "assistant", content: replyContent }
  });

  res.json({
    message: {
      id: assistantMessage.id,
      role: assistantMessage.role,
      content: assistantMessage.content,
      timestamp: assistantMessage.createdAt.toISOString(),
      conversationId: assistantMessage.conversationId,
    },
    conversationId: conv!.id,
  });
};

export const history = async (req: AuthedRequest, res: Response) => {
  const data = await prisma.conversation.findMany({
    where: { userId: req.user!.id },
    include: { messages: { orderBy: { createdAt: "asc" } } }
  });
  res.json(data);
};

export const deleteConversation = async (req: AuthedRequest, res: Response) => {
  await prisma.conversation.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
