import "express-async-errors";
import express from "express";
import cors from "cors";
import { config } from "./config";
import router from "./routes/lipaRoute";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import serverless from "serverless-http";

const app = express();

app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/lipa", router);

// Centralized Error Handling
app.use(errorHandler);

export const handler = serverless(app);

if (config.NODE_ENV !== "test") {
  app.listen(config.PORT, () => {
    logger.info(`🚀 Server is running on port ${config.PORT}`);
  });
}

export default app;
