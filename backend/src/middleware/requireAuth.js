import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "./errorHandler.js";

/**
 * Reads the JWT from the httpOnly cookie (or Authorization header for
 * API clients), verifies it, and attaches the user to req.user.
 */
export async function requireAuth(req, _res, next) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) throw new ApiError(401, "Not authenticated");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const expired = err.name === "TokenExpiredError";
      throw new ApiError(401, expired ? "Session expired" : "Invalid session");
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "Account no longer exists");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
