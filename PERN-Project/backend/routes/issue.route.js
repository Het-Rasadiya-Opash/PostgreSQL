import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleBaseAuth.js";
import { createIssue, getIssues, getIssueById, updateIssue, deleteIssue } from "../controllers/issue.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getIssues);
router.post("/", authMiddleware, createIssue);
router.get("/:id", authMiddleware, getIssueById);
router.put("/:id", authMiddleware, updateIssue);
router.delete("/:id", authMiddleware, authorizeRole("PROJECT_MANAGER"), deleteIssue);

export default router;