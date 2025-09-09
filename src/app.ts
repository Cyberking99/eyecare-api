// src/app.ts
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/error";
import rateLimit from "./middleware/rateLimit";
import authRoutes from "./modules/auth/auth.routes";
import chatRoutes from "./modules/chat/chat.routes";
import educationRoutes from "./modules/educations/educations.routes";
import exerciseRoutes from "./modules/exercises/exercises.routes";
import exportRoutes from "./modules/export/export.routes";
import scanRoutes from "./modules/scans/scans.routes";
import testRoutes from "./modules/tests/tests.routes";
import userRoutes from "./modules/users/users.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/educations", educationRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/export", exportRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

export default app;
