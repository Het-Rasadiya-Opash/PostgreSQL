import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createProject,
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

export default router;
