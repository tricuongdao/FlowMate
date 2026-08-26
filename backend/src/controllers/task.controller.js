import Task from "../models/Task.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * Resolve a named date filter to an inclusive lower bound on createdAt.
 */
function startDateFor(filter) {
  const now = new Date();
  switch (filter) {
    case "today": {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    case "week": {
      // Monday of the current week (ISO week start)
      const day = now.getDay(); // 0 = Sunday
      const offsetToMonday = day === 0 ? 6 : day - 1;
      const monday = now.getDate() - offsetToMonday;
      return new Date(now.getFullYear(), now.getMonth(), monday);
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "all":
    default:
      return null;
  }
}

/**
 * GET /api/tasks: filtered, paginated list for the signed-in user,
 * plus GLOBAL (all-status) counts for the UI badges.
 */
export async function getTasks(req, res, next) {
  try {
    const { filter = "all", status = "all", search, page = 1, limit = 10 } =
      req.query;

    const createdFrom = startDateFor(filter);
    const baseMatch = { user: req.user._id };
    if (createdFrom) baseMatch.createdAt = { $gte: createdFrom };
    if (search) {
      baseMatch.$text = { $search: search };
    }

    const statusMatches = status !== "all" ? [{ $match: { status } }] : [];
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: baseMatch },
      {
        $facet: {
          tasks: [
            ...statusMatches,
            ...(search ? [{ $sort: { __score: { $meta: "textScore" }, createdAt: -1 } }] : [{ $sort: { createdAt: -1 } }]),
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [...statusMatches, { $count: "count" }],
          activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
          completeCount: [
            { $match: { status: "complete" } },
            { $count: "count" },
          ],
        },
      },
    ];

    const [result] = await Task.aggregate(pipeline);

    const totalItems = result.totalCount[0]?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    res.status(200).json({
      tasks: result.tasks,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      activeCount: result.activeCount[0]?.count ?? 0,
      completeCount: result.completeCount[0]?.count ?? 0,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/tasks */
export async function createTask(req, res, next) {
  try {
    const { title, dueDate } = req.body;
    const task = await Task.create({
      user: req.user._id,
      title,
      dueDate: dueDate ?? null,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tasks/:id: partial update; completedAt is server-owned.
 * Scoped to the owner: another user's id is indistinguishable from a
 * missing one (404), never a 403 that leaks existence.
 */
export async function updateTask(req, res, next) {
  try {
    const { title, status, dueDate } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (dueDate !== undefined) updates.dueDate = dueDate ?? null;
    if (status !== undefined) {
      updates.status = status;
      updates.completedAt = status === "complete" ? new Date() : null; // server owns this
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTask) throw new ApiError(404, "Task not found");

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/tasks/:id: scoped to the owner. */
export async function deleteTask(req, res, next) {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!deleted) throw new ApiError(404, "Task not found");
    res.status(200).json({ message: "Task deleted", task: deleted });
  } catch (error) {
    next(error);
  }
}
