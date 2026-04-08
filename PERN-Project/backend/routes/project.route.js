import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createProject } from "../controllers/project.controller.js";
import { authorizeRole } from "../middlewares/roleBaseAuth.js";
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRole("PROJECT_MANAGER"),
  createProject,
);

export default router;
