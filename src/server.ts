// src/server.ts
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { chatSocket } from "./sockets/chat.socket";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
chatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`AIEyeCare API running on :${PORT}`));
