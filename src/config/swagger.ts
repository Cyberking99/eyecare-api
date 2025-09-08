// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "AIEyeCare API", version: "1.0.0" },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/modules/**/*.routes.ts"], // add JSDoc comments in routes if desired
});
