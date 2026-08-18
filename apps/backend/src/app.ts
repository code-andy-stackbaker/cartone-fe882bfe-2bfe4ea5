import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import { createCheckoutRouter } from "./routes/checkout";
import { createProductRouter } from "./routes/products";

/** Comma-separated allowlist injected at deploy; permissive fallback for dev. */
function corsOptions(): CorsOptions {
  const raw = process.env.ALLOWED_ORIGINS;
  const origins = (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return { origin: true };
  }
  return { origin: origins };
}

export function createApp(): Express {
  const app = express();

  app.use(cors(corsOptions()));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", createProductRouter());
  app.use("/api", createCheckoutRouter());

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  return app;
}
