import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createComment, getComments } from "../controllers/comment.controller.js";

const router = express.Router();

// Issue comments
router.get("/issue/:issueId", authMiddleware, getComments);
router.post("/", authMiddleware, createComment);

export default router;
