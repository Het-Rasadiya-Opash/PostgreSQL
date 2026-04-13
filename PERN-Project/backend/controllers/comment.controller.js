import { prisma } from "../config/db.js";

export const getComments = async (req, res) => {
  const { issueId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { issueId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};

export const createComment = async (req, res) => {
  const { body, issueId } = req.body;
  const authorId = req.user.userId;

  if (!body?.trim() || !issueId)
    return res.status(400).json({ message: "Body and issueId are required" });

  try {
    const comment = await prisma.comment.create({
      data: { body, issueId, authorId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    // Notify all stakeholders (reporter, assignee, project owner/PM) except the commenter
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        title: true,
        assigneeId: true,
        reporterId: true,
        project: {
          select: {
            ownerId: true,
            members: { select: { id: true, role: true } },
          },
        },
      },
    });

    if (issue) {
      const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true },
      });

      const pmIds = [
        issue.project.ownerId,
        ...issue.project.members
          .filter((m) => m.role === "PROJECT_MANAGER")
          .map((m) => m.id),
      ];

      const notifyIds = [...new Set([
        issue.assigneeId,
        issue.reporterId,
        ...pmIds,
      ].filter((id) => id && id !== authorId))];

      if (notifyIds.length > 0) {
        await prisma.notification.createMany({
          data: notifyIds.map((userId) => ({
            userId,
            message: `${author?.name || "Someone"} commented on issue "${issue.title}"`,
            type: "COMMENT",
          })),
          skipDuplicates: true,
        });
      }
    }

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: "Error creating comment" });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role?.toUpperCase();

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.authorId !== userId && userRole !== "ADMIN" && userRole !== "PROJECT_MANAGER")
      return res.status(403).json({ message: "Not authorized to delete this comment" });

    await prisma.comment.delete({ where: { id } });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};
