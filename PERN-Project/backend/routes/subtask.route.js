import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createSubTask, toggleSubTask, deleteSubTask } from "../controllers/subtask.controller.js";

const router = express.Router();

router.post("/:issueId", authMiddleware, createSubTask);
router.patch("/:id/toggle", authMiddleware, toggleSubTask);
router.delete("/:id", authMiddleware, deleteSubTask);

export default router;
