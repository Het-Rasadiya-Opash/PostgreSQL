import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addMemberToProject,
  createProject,
  deleteProject,
  editProject,
  getProjectById,
  getProjects,
  removeMemberFromProject,
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
  "/members/add",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  addMemberToProject,
);

router.put(
  "/members/remove",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  removeMemberFromProject,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  deleteProject,
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  editProject,
);

export default router;
