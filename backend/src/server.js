import mongoose from "mongoose";
import dotenv from "dotenv";
import expressRateLimit from "express-rate-limit";
import { createApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;

if (!MONGODB_CONNECTION_STRING) {
  console.error("Missing MONGODB_CONNECTION_STRING in environment. Exiting.");
  process.exit(1);
}

// In production the JWT secret comes from the environment. Dev/test get a
// deterministic fallback so the app boots without extra setup.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("Missing JWT_SECRET in environment (required in production). Exiting.");
  process.exit(1);
}
process.env.JWT_SECRET = JWT_SECRET || "dev-only-insecure-secret";

// Gentle default: 300 requests per minute per IP.
const apiLimiter = expressRateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const app = createApp(apiLimiter);

let server;

// Retry the DB connection so a slow Atlas handshake (or a cold Render start)
// doesn't hard-crash the deploy. Keeps trying with backoff, then gives up.
const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 5000;

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGODB_CONNECTION_STRING, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(
      `MongoDB connect failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.message}`
    );
    if (attempt >= MAX_ATTEMPTS) {
      console.error(
        "Could not reach MongoDB after retries. Check: (1) Atlas Network " +
          "Access allows 0.0.0.0/0, (2) MONGODB_CONNECTION_STRING password is " +
          "correct and special characters are URL-encoded."
      );
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

async function start() {
  await connectWithRetry();

  server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Graceful shutdown: stop accepting connections, close DB, then exit.
async function shutdown(signal) {
  console.log(`\n${signal} received: shutting down gracefully`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
