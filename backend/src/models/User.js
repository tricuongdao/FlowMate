import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name must be 80 characters or fewer"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned unless explicitly .select("+passwordHash")
    },
  },
  { timestamps: true }
);

/** Hash the password whenever it's set or changed. */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  next();
});

userSchema.methods.verifyPassword = function verifyPassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return { id: this._id, email: this.email, name: this.name };
};

const User = mongoose.model("User", userSchema);
export default User;
