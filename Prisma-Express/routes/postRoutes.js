import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  searchPosts,
  updatePost,
} from "../controller/postController.js";
const router = express.Router();

router.get("/", getAllPosts);
router.post("/", createPost);
router.get("/search", searchPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
