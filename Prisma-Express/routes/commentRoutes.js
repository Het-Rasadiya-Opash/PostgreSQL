import express from "express";
import {
  createComment,
  deleteComment,
  fetchComments,
  showCommentById,
} from "../controller/commentController.js";
const router = express.Router();

router.post("/", createComment);
router.get("/:id", showCommentById);
router.delete("/:id", deleteComment);
router.get("/", fetchComments);

export default router;
