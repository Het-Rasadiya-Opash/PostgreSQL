import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleBaseAuth.js";
import { createSprint, deleteSprint, getSprintInsights, getSprints, updateSprint } from "../controllers/sprint.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getSprints);
router.get("/insights/:projectId", authMiddleware, getSprintInsights);
router.post("/", authMiddleware, authorizeRole("PROJECT_MANAGER"), createSprint);
router.put("/:id", authMiddleware, authorizeRole("PROJECT_MANAGER"), updateSprint);
router.delete("/:id", authMiddleware, authorizeRole("PROJECT_MANAGER"), deleteSprint);

export default router;
