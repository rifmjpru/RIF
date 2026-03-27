import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import publicRoutes from "./routes/public-routes.js";
import authRoutes from "./routes/auth-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const allowedOrigins = new Set(env.frontendOrigins);
const normalizeOrigin = (value) => value?.replace(/\/+$/, "");

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    }
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (_request, response) => {
  response.json({
    message: "RIF API is running."
  });
});

app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);
