import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addMemberToProject,
  createProject,
  getProjectById,
  getProjects,
} from "../controllers/project.controller.js";
import { authorizeRole } from "../middlewares/roleBaseAuth.js";
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  createProject,
);

router.get("/", authMiddleware, getProjects);

router.get("/:id", authMiddleware, getProjectById);

router.put(
  "/",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  addMemberToProject,
);

export default router;
