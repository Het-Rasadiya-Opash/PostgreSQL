import express from "express";
import {
  createComment,
  deleteComment,
  fetchComments,
  showCommentById,
  updateComment,
} from "../controller/commentController.js";
const router = express.Router();

router.post("/", createComment);
router.get("/", fetchComments);
router.put("/:id", updateComment);
router.get("/:id", showCommentById);
router.delete("/:id", deleteComment);

export default router;
