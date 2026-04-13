import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getComments, createComment, deleteComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/issue/:issueId", authMiddleware, getComments);
router.post("/", authMiddleware, createComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
