// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
export default rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
});
