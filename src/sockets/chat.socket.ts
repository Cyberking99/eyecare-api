import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { chatCompletion } from "../services/openai";

const prisma = new PrismaClient();

export function chatSocket(io: Server) {
  io.on("connection", (socket) => {
    socket.on("chat:message", async ({ token, conversationId, content }) => {
      // (Optionally verify JWT here to identify user)
      // ...verify and get userId...
      const conv = conversationId
        ? await prisma.conversation.findUnique({ where: { id: conversationId } })
        : await prisma.conversation.create({ data: { userId: /*userId*/ "unknown" } });

      await prisma.chatMessage.create({ data: { conversationId: conv!.id, role: "user", content } });
      const reply = await chatCompletion([{ role: "user", content }]);
      await prisma.chatMessage.create({ data: { conversationId: conv!.id, role: "assistant", content: reply } });

      socket.emit("chat:reply", { conversationId: conv!.id, reply });
    });
  });
}
