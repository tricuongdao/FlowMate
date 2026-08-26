import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ApiError } from "../middleware/errorHandler.js";
import { schemas, validate } from "../validation/task.validation.js";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";

/** Sign a session JWT and set it as an httpOnly cookie. */
function issueSession(res, user) {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // HTTPS-only in production (Render terminates TLS)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post(
  "/register",
  validate(schemas.register),
  async (req, res, next) => {
    try {
      const { email, name, password } = req.body;

      if ((await User.exists({ email }))) {
        throw new ApiError(409, "An account with this email already exists");
      }

      const user = await User.create({
        email,
        name,
        passwordHash: password, // hashed by the pre-save hook
      });

      issueSession(res, user);
      res.status(201).json({ user: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/login", validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Generic message: never reveal whether the email exists.
    let user = await User.findOne({ email }).select("+passwordHash");

    const ok = user ? await user.verifyPassword(password) : false;
    if (!ok) throw new ApiError(401, "Invalid email or password");

    issueSession(res, user);
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

export default router;