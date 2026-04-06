import { prisma } from "../db/db.config.js";

export const createPost = async (req, res) => {
  try {
    const { user_id, title, description } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await prisma.post.create({
      data: { user_id: Number(user_id), title, description },
    });
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        comments: {
          include: { user: true },
        },
      },
      orderBy: { id: "desc" },
      // where: {
      //   comment_count: {
      //     gte: 1,
      //   },
      // },
      // where: {
      //   AND: [
      //     {
      //       title: {
      //         startsWith: "post",
      //       },
      //     },
      //     {
      //       title: {
      //         endsWith: "1",
      //       },
      //     },
      //   ],
      // },
    });
    return res
      .status(200)
      .json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ message: "Post fetched successfully", post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const updated = await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { title: req.body.title, description: req.body.description },
    });
    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await prisma.post.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  const query = req.query.q;
  try {
    const posts = await prisma.post.findMany({
      where: {
        description: {
          search: query,
        },
      },
    });
    return res
      .status(200)
      .json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
