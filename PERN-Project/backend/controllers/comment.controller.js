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

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        title: true,
        assigneeId: true,
        reporterId: true,
        project: {
          select: {
            ownerId: true,
            members: { select: { id: true, role: true, name: true } },
          },
        },
      },
    });

    if (issue) {
      const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true },
      });

      // Parse @mentions from body
      const mentionedNames = [
        ...body.matchAll(/@([\w\s]+?)(?=\s|$|[^\w\s])/g),
      ].map((m) => m[1].trim().toLowerCase());
      const allMembers = [
        ...issue.project.members,
        { id: issue.project.ownerId, name: null },
      ];

      // Fetch all project member names for mention matching
      const projectUsers = await prisma.user.findMany({
        where: { id: { in: allMembers.map((m) => m.id) } },
        select: { id: true, name: true },
      });

      const mentionedIds = projectUsers
        .filter((u) =>
          mentionedNames.some((mn) => u.name?.toLowerCase().includes(mn)),
        )
        .map((u) => u.id)
        .filter((id) => id !== authorId);

      // Notify mentions first (higher priority)
      if (mentionedIds.length > 0) {
        await prisma.notification.createMany({
          data: mentionedIds.map((userId) => ({
            userId,
            message: `${author?.name || "Someone"} mentioned you in a comment on "${issue.title}"`,
            type: "MENTION",
          })),
          skipDuplicates: true,
        });
      }

      // Notify other stakeholders (excluding already-mentioned)
      const pmIds = [
        issue.project.ownerId,
        ...issue.project.members
          .filter((m) => m.role === "PROJECT_MANAGER")
          .map((m) => m.id),
      ];
      const notifyIds = [
        ...new Set(
          [issue.assigneeId, issue.reporterId, ...pmIds].filter(
            (id) => id && id !== authorId && !mentionedIds.includes(id),
          ),
        ),
      ];

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

    if (
      comment.authorId !== userId &&
      userRole !== "ADMIN" &&
      userRole !== "PROJECT_MANAGER"
    )
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });

    await prisma.comment.delete({ where: { id } });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};
