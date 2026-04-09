import { prisma } from "../config/db.js";

export const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      sprintId,
    } = req.body;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ message: "Title and projectId are required" });
    }

    const userId = req.user.userId;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
    });

    if (!project) {
      return res
        .status(403)
        .json({ message: "Not authorized or project not found" });
    }

    const validStatus = ["TODO", "IN_PROGRESS", "DONE"];
    const validPriority = ["LOW", "MEDIUM", "HIGH"];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    if (assigneeId) {
      const validAssignee = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: assigneeId },
            { members: { some: { id: assigneeId } } },
          ],
        },
      });

      if (!validAssignee) {
        return res.status(400).json({ message: "Assignee not in project" });
      }
    }

    if (sprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
      });

      if (!sprint || sprint.projectId !== projectId) {
        return res.status(400).json({ message: "Invalid sprint" });
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        projectId,
        assigneeId,
        reporterId: userId,
        sprintId,
      },
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssues = async (req, res) => {
  const userId = req.user.userId;
  try {
    const issues = await prisma.issue.findMany({
      where: {
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        reporter: { select: { id: true, name: true, avatar: true } },
        sprint: { select: { id: true, name: true } },
      },
    });
    res.json({ message: "Issues fetched successfully", issues });
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues" });
  }
};

export const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        reporter: { select: { id: true, name: true, avatar: true } },
        sprint: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Issue fetched successfully", issue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching issue" });
  }
};

export const updateIssue = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assigneeId, sprintId } =
    req.body;
  try {
    const issue = await prisma.issue.update({
      where: { id },
      data: { title, description, status, priority, assigneeId, sprintId },
    });
    res.json({ message: "Issue updated successfully", issue });
  } catch (error) {
    res.status(500).json({ message: "Error updating issue" });
  }
};

export const deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.issue.delete({ where: { id } });
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting issue" });
  }
};
