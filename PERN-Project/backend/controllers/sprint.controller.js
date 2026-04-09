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
    res.json({ message: "Sprint updated successfully", sprint });
  } catch (error) {
    res.status(500).json({ message: "Error updating sprint" });
  }
};
