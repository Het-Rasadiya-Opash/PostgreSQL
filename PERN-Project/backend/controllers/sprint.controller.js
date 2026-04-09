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
      await prisma.issue.updateMany({
        where: { sprintId: id },
        data: { status: "DONE" },
      });
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
