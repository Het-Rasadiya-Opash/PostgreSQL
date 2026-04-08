import { prisma } from "../config/db.js";

export const createProject = async (req, res) => {
  try {
    const { name, key, description } = req.body;
    const existingProject = await prisma.project.findUnique({
      where: { key },
    });
    if (existingProject) {
      return res.status(400).json({ message: "Project key already exists" });
    }
    const project = await prisma.project.create({
      data: {
        name,
        key,
        description,
        ownerId: req.user.userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
};

export const getProjects = async (req, res) => {
  const userId = req.user.userId;

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId }, // Projects they created
          { members: { some: { id: userId } } }, // Projects they joined
        ],
      },
      include: {
        owner: {
          select: { name: true, avatar: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    res.json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching project" });
  }
};

export const addMemberToProject = async (req, res) => {
  const { projectId, userId } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId }, // Adds the user to the members array
        },
      },
      include: { members: true },
    });

    res.json({ message: "Member added", updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error adding member" });
  }
};

export const removeMemberFromProject = async (req, res) => {
  const { projectId, userId } = req.body;
  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: userId }, // Removes the user from the members array
        },
      },
    });
    res.json({ message: "Member removed", updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error removing member" });
  }
};
