import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { schemas, validate } from "../validation/task.validation.js";

const router = express.Router();

router.get("/", validate(schemas.listTasks), getTasks);
router.post("/", validate(schemas.createTask), createTask);
router.put("/:id", validate(schemas.updateTask), updateTask);
router.delete("/:id", validate(schemas.deleteTask), deleteTask);

export default router;
