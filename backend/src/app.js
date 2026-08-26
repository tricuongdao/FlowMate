import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import taskRoutes from "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { ApiError } from "./middleware/errorHandler.js";

const __dirname = path.resolve();

/** Extra browser origins allowed to call the API cross-origin (dev setup). */
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * True when the request's Origin is this server itself: i.e. the SPA
 * served by this very process. Module scripts ALWAYS carry an Origin
 * header (even same-origin), so this case must be allowed explicitly
 * or the app 403s its own frontend and renders blank.
 */
function isSameOrigin(origin, hostHeader) {
  try {
    return new URL(origin).host === hostHeader; // host includes port
  } catch {
    return false; // malformed Origin header
  }
}

export function createApp(rateLimiter) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // correct client IPs behind Render/Heroku-style proxies

  // Security headers.
  // upgrade-insecure-requests is disabled on purpose: it silently rewrites
  // http:// asset URLs to https://, which breaks any plain-HTTP deployment
  // (local docker, staging previews). Add it back at the TLS-terminating
  // edge (Render/Cloudflare) when the site is served over HTTPS.
  const cspDirectives = {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "upgrade-insecure-requests": null,
  };
  app.use(
    helmet({
      contentSecurityPolicy: { directives: cspDirectives },
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ────────────────────────────────────────────────────────────────
  // Hand-rolled so one rule is explicit: requests from THIS server itself
  // (same-origin) are always allowed, alongside the configured allow-list
  // used for the split dev setup (:5173 front end → :5001 API).
  app.use(function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (!origin) return next(); // curl, supertest, same-origin GET navigations

    const sameOrigin = isSameOrigin(origin, req.headers.host);
    if (sameOrigin || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Credentials", "true"); // auth cookies
      if (req.method === "OPTIONS") return res.status(204).end(); // preflight
      return next();
    }

    return next(new ApiError(403, "Origin not allowed by CORS"));
  });

  // Basic abuse protection
  if (rateLimiter) app.use(rateLimiter);

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  // Health check for uptime monitors and container orchestration
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  // All task routes require a signed-in user: tasks are per-account now
  app.use("/api/tasks", requireAuth, taskRoutes);

  // Serve the built frontend in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
  }

  // 404 for unknown API routes
  app.use("/api", (_req, _res, next) => next(new ApiError(404, "Route not found")));

  // Central error handler: must have all four args
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let details = err.details;

    if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid id format";
      details = undefined;
    }
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = "Validation failed";
      details = Object.fromEntries(
        Object.entries(err.errors || {}).map(([field, e]) => [field, e.message])
      );
    }
    if (err.code === 11000) {
      // Duplicate key: unique email index
      statusCode = 409;
      message = "An account with this email already exists";
    }
    // Malformed JSON bodies
    if (err.type === "entity.parse.failed") {
      statusCode = 400;
      message = "Malformed JSON body";
    }
    if (err.type === "entity.too.large") {
      statusCode = 413;
      message = "Request body too large";
    }

    if (statusCode >= 500) {
      console.error("[error]", err.stack || err);
      message = "Internal server error";
      details = undefined;
    }

    res.status(statusCode).json({ message, ...(details ? { details } : {}) });
  });

  return app;
}
