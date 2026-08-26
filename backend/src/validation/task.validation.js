import { z } from "zod";
import { ApiError } from "../middleware/errorHandler.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const listQuery = z.object({
  filter: z.enum(["today", "week", "month", "all"]).default("all"),
  status: z.enum(["all", "active", "complete"]).default("all"),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const createBody = z.object({
  title: z
    .string({ message: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or fewer"),
  dueDate: isoDateField().nullish(),
});

const updateBody = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title must be 200 characters or fewer").optional(),
    status: z.enum(["active", "complete"]).optional(),
    dueDate: isoDateField().nullish(),
  })
  .strict() // reject unknown fields so clients can't smuggle in completedAt etc.
  .refine(
    (body) =>
      body.title !== undefined ||
      body.status !== undefined ||
      body.dueDate !== undefined,
    { message: "Provide a title, status and/or due date" }
  );

// req.params is an object like { id: "..." }, so wrap the id rule
const idParams = z.object({ id: objectId });

// ── Auth ──────────────────────────────────────────────────────────────────
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer");

const registerBody = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    name: z.string().trim().min(1, "Name is required").max(80),
    password,
  })
  .strict();

const loginBody = z
  .object({
    email: z.string().trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

function isoDateField() {
  return z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Must be a valid date",
    });
}

/** Per-route validation contracts: which req parts to check, and how. */
export const schemas = {
  listTasks: { query: listQuery },
  createTask: { body: createBody },
  updateTask: { params: idParams, body: updateBody },
  deleteTask: { params: idParams },
  register: { body: registerBody },
  login: { body: loginBody },
};

/**
 * Middleware factory: parses and replaces req.body / req.params / req.query
 * with the schema result, so controllers receive clean, typed data.
 * On failure, responds 400 with per-field details.
 */
export function validate(contract) {
  return function validationMiddleware(req, _res, next) {
    try {
      for (const part of Object.keys(contract)) {
        const parsed = contract[part].parse(req[part] ?? {});
        // Express makes req.query a getter on GET requests; assign safely.
        if (part === "query") {
          Object.defineProperty(req, "query", {
            value: parsed,
            writable: true,
            configurable: true,
          });
        } else {
          req[part] = parsed;
        }
      }
      next();
    } catch (error) {
      next(formatZodError(error));
    }
  };
}

/** Convert a ZodError into an ApiError with per-field details. */
export function formatZodError(zodError) {
  const details = {};
  for (const issue of zodError.issues || []) {
    // strict() reports unknown fields on the object itself: expand them
    if (issue.code === "unrecognized_keys") {
      for (const key of issue.keys || []) {
        details[key] = "Unknown field";
      }
      continue;
    }
    const field = issue.path.join(".") || "body";
    if (!details[field]) details[field] = issue.message;
  }
  return new ApiError(400, "Validation failed", details);
}
