import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title must be 200 characters or fewer"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "complete"],
        message: "Status must be either 'active' or 'complete'",
      },
      default: "active",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt are added automatically
  }
);

// Text search on titles
taskSchema.index({ title: "text" });
// Covers the list query: per-user date scope + newest-first sort
taskSchema.index({ user: 1, createdAt: -1 });
// Covers the status facet counts
taskSchema.index({ user: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;
