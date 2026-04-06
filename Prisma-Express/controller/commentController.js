import { prisma } from "../db/db.config.js";

export const fetchComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: { user: true, post: { include: { user: true } } },
    });
    return res
      .status(200)
      .json({ message: "Comments fetched successfully", data: comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { user_id, post_id, comment } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: Number(post_id) },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const [newComment] = await prisma.$transaction([
      prisma.comment.create({
        data: { user_id: Number(user_id), post_id: Number(post_id), comment },
      }),
      prisma.post.update({
        where: { id: Number(post_id) },
        data: { comment_count: { increment: 1 } },
      }),
    ]);

    return res
      .status(201)
      .json({ message: "Comment created successfully", data: newComment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const showCommentById = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    return res
      .status(200)
      .json({ message: "Comment fetched successfully", data: comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await prisma.$transaction([
      prisma.comment.delete({ where: { id: req.params.id } }),
      prisma.post.update({
        where: { id: comment.post_id },
        data: { comment_count: { decrement: 1 } },
      }),
    ]);

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { comment: req.body.comment },
    });

    return res
      .status(200)
      .json({ message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
