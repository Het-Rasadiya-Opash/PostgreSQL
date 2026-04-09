import { prisma } from "../config/db.js";

export const createComment = async (req, res) => {
  const { body, issueId } = req.body;
  const userId = req.user.userId;

  if (!body || !issueId) {
    return res.status(400).json({ message: "Body and issueId are required" });
  }
  try {
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
    });
    if (!issue) {
      return res
        .status(403)
        .json({ message: "Not authorized or issue not found" });
    }
    const comment = await prisma.comment.create({
      data: {
        body,
        issueId,
        authorId: userId,
      },
      include: {
        author: true,
      },
    });
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { issueId } = req.params;
  const userId = req.user.userId;

  try {
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
    });
    if (!issue) {
      return res
        .status(403)
        .json({ message: "Not authorized or issue not found" });
    }
    const comments = await prisma.comment.findMany({
      where: {
        issueId,
      },
      include: {
        author: true,
      },
    });
    res.status(200).json({ message: "Comments retrieved successfully", comments });

  } catch (error) {
    console.error("Error retrieving comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


