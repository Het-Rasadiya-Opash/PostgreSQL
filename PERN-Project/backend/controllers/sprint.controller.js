import { prisma } from "../config/db.js";


export const createSprint = async (req, res) => {
  const { projectId, name, goal, startDate, endDate } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Sprint name is required" });
  }

  try {
    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId,
      },
    });


    res.status(201).json({
      message: "Sprint created successfully",
      sprint,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating sprint" });
  }
};

export const getSprints = async (req, res) => {
  const { projectId } = req.query;
  try {
    const sprints = await prisma.sprint.findMany({
      where: projectId ? { projectId } : {},
      include: { _count: { select: { issues: true } } },
    });
    res.json({ message: "Sprints fetched successfully", sprints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sprints" });
  }
};

export const updateSprint = async (req, res) => {
  const { id } = req.params;
  const { name, goal, startDate, endDate, status } = req.body;
  try {
    const sprint = await prisma.sprint.update({
      where: { id },
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
    });



    // AUTOMATION: Sync issue statuses with sprint status transitions
    if (status === "COMPLETED") {
      // Get all issues in this sprint
      const sprintIssues = await prisma.issue.findMany({
        where: { sprintId: id },
        select: { id: true },
      });
      const issueIds = sprintIssues.map((i) => i.id);

      // Mark all issues DONE
      await prisma.issue.updateMany({
        where: { sprintId: id },
        data: { status: "DONE" },
      });

      // Mark all subtasks of those issues as completed
      if (issueIds.length > 0) {
        await prisma.subTask.updateMany({
          where: { issueId: { in: issueIds } },
          data: { isCompleted: true },
        });
      }
    } else if (status === "ACTIVE") {
      await prisma.issue.updateMany({
        where: { sprintId: id, NOT: { status: "DONE" } }, // Don't move already done issues back to progress
        data: { status: "IN_PROGRESS" },
      });
    } else if (status === "PLANNED") {
      await prisma.issue.updateMany({
        where: { sprintId: id },
        data: { status: "TODO" },
      });
    }

    res.json({ message: "Sprint updated successfully", sprint });
  } catch (error) {
    console.error("Error updating sprint:", error);
    res.status(500).json({ message: "Error updating sprint" });
  }
};

export const deleteSprint = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.sprint.delete({ where: { id } });
    res.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sprint" });
  }
};

export const getSprintInsights = async (req, res) => {
  const { projectId } = req.params;
  try {
    // Get last 5 sprints for this project to calculate velocity
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
        issues: {
          select: {
            status: true,
          },
        },
      },
    });

    // Calculate velocity (completed issues per sprint)
    const velocityData = sprints.map(s => ({
      name: s.name,
      totalIssues: s._count.issues,
      completedIssues: s.issues.filter(i => i.status === "DONE").length,
      status: s.status,
    })).reverse();

    res.json({ velocityData });
  } catch (error) {
    console.error("Error fetching sprint insights:", error);
    res.status(500).json({ message: "Error fetching sprint insights" });
  }
};
