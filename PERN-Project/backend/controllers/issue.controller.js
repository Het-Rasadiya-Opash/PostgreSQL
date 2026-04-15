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
      dueDate,
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
        assigneeId: assigneeId || null,
        reporterId: userId,
        sprintId: sprintId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Notify assignee
    if (assigneeId && assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          message: `You were assigned to issue "${title}"`,
          type: "ASSIGNMENT",
        },
      });
    }

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });

    // Log creation activity (fire and forget)
    prisma.issueActivity.create({
      data: { issueId: issue.id, actorId: userId, field: "created", oldValue: null, newValue: issue.title },
    }).catch(() => {});

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
        project: { select: { id: true, name: true, key: true } },
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
        subTasks: { orderBy: { createdAt: "asc" } },
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
  const {
    title,
    description,
    status,
    priority,
    assigneeId,
    sprintId,
    dueDate,
  } = req.body;
  try {
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (sprintId !== undefined) updateData.sprintId = sprintId || null;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    // Fetch BEFORE update for comparison
    const existing = await prisma.issue.findUnique({
      where: { id },
      select: {
        title: true,
        status: true,
        priority: true,
        assigneeId: true,
        project: {
          select: {
            ownerId: true,
            members: { select: { id: true, role: true } },
          },
        },
      },
    });

    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
    });

    // Sprint auto-management based on issue status changes
    if (status !== undefined && issue.sprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: issue.sprintId },
        select: { id: true, status: true },
      });

      if (sprint) {
        // Get all issues in this sprint after the update
        const allSprintIssues = await prisma.issue.findMany({
          where: { sprintId: issue.sprintId },
          select: { id: true, status: true },
        });

        const allDone = allSprintIssues.every(i => i.status === "DONE");
        const allTodo = allSprintIssues.every(i => i.status === "TODO");
        const anyActive = allSprintIssues.some(i => i.status === "IN_PROGRESS" || i.status === "DONE");

        let newSprintStatus = null;

        if (allDone && sprint.status !== "COMPLETED") {
          newSprintStatus = "COMPLETED";
          // Mark all subtasks complete
          await prisma.subTask.updateMany({
            where: { issue: { sprintId: issue.sprintId } },
            data: { isCompleted: true },
          });
        } else if (allTodo && sprint.status !== "PLANNED") {
          newSprintStatus = "PLANNED";
        } else if (anyActive && sprint.status === "PLANNED") {
          newSprintStatus = "ACTIVE";
        } else if (anyActive && sprint.status === "COMPLETED") {
          newSprintStatus = "ACTIVE";
        }

        if (newSprintStatus) {
          await prisma.sprint.update({
            where: { id: issue.sprintId },
            data: { status: newSprintStatus },
          });
        }
      }
    }

    const actorId = req.user.userId;
    const actorRole = req.user.role?.toUpperCase();
    const statusLabels = {
      TODO: "To Do",
      IN_PROGRESS: "In Progress",
      DONE: "Done",
    };

    // Log activity for tracked field changes
    if (existing) {
      const activityEntries = [];

      if (status && status !== existing.status)
        activityEntries.push({ issueId: id, actorId, field: "status",
          oldValue: statusLabels[existing.status] || existing.status,
          newValue: statusLabels[status] || status });

      if (priority !== undefined && priority !== existing.priority)
        activityEntries.push({ issueId: id, actorId, field: "priority",
          oldValue: existing.priority, newValue: priority });

      if (title !== undefined && title !== existing.title)
        activityEntries.push({ issueId: id, actorId, field: "title",
          oldValue: existing.title, newValue: title });

      if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
        const [newA, oldA] = await Promise.all([
          assigneeId ? prisma.user.findUnique({ where: { id: assigneeId }, select: { name: true } }) : null,
          existing.assigneeId ? prisma.user.findUnique({ where: { id: existing.assigneeId }, select: { name: true } }) : null,
        ]);
        activityEntries.push({ issueId: id, actorId, field: "assignee",
          oldValue: oldA?.name || null, newValue: newA?.name || null });
      }

      if (activityEntries.length > 0)
        await prisma.issueActivity.createMany({ data: activityEntries });
    }

    // Notify on status change
    if (status && existing && status !== existing.status) {
      const msg = `Issue "${existing.title}" status changed from ${statusLabels[existing.status] || existing.status} → ${statusLabels[status] || status}`;

      if (actorRole === "PROJECT_MANAGER" || actorRole === "ADMIN") {
        // PM/Admin changed status → notify the assignee (developer)
        if (existing.assigneeId && existing.assigneeId !== actorId) {
          await prisma.notification.create({
            data: {
              userId: existing.assigneeId,
              message: msg,
              type: "STATUS_CHANGE",
            },
          });
        }
      } else {
        // Developer/User changed status → notify PMs
        const pmIds = [
          existing.project.ownerId,
          ...existing.project.members
            .filter((m) => m.role === "PROJECT_MANAGER")
            .map((m) => m.id),
        ].filter((pmId) => pmId !== actorId);

        const uniquePmIds = [...new Set(pmIds)];
        if (uniquePmIds.length > 0) {
          await prisma.notification.createMany({
            data: uniquePmIds.map((pmId) => ({
              userId: pmId,
              message: msg,
              type: "STATUS_CHANGE",
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    // Notify on assignee handover
    if (assigneeId !== undefined && existing) {
      const oldAssigneeId = existing.assigneeId;
      const newAssigneeId = assigneeId || null;

      if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
        // Fetch both user names for the messages
        const [newAssignee, oldAssignee] = await Promise.all([
          prisma.user.findUnique({
            where: { id: newAssigneeId },
            select: { name: true },
          }),
          oldAssigneeId
            ? prisma.user.findUnique({
                where: { id: oldAssigneeId },
                select: { name: true },
              })
            : null,
        ]);

        // Notify new assignee
        await prisma.notification.create({
          data: {
            userId: newAssigneeId,
            message:
              oldAssigneeId && oldAssignee
                ? `Issue "${existing.title}" has been handed over to you from ${oldAssignee.name}`
                : `You have been assigned to issue "${existing.title}"`,
            type: "ASSIGNMENT",
          },
        });

        // Notify old assignee they were removed
        if (
          oldAssigneeId &&
          oldAssigneeId !== actorId &&
          oldAssigneeId !== newAssigneeId
        ) {
          await prisma.notification.create({
            data: {
              userId: oldAssigneeId,
              message: `Issue "${existing.title}" has been reassigned to ${newAssignee?.name || "someone else"}`,
              type: "HANDOVER",
            },
          });
        }
      }

      // Notify if unassigned (assigneeId = null/empty)
      if (!newAssigneeId && oldAssigneeId && oldAssigneeId !== actorId) {
        await prisma.notification.create({
          data: {
            userId: oldAssigneeId,
            message: `You have been unassigned from issue "${existing.title}"`,
            type: "HANDOVER",
          },
        });
      }
    }

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

export const getIssueActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const activities = await prisma.issueActivity.findMany({
      where: { issueId: id },
      include: { actor: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity" });
  }
};
