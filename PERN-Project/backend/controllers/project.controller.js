import { prisma } from "../config/db.js";


export const createProject = async (req, res) => {
  try {
    const { name, key, description } = req.body;
    const userId = req.user.userId;
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
        ownerId: userId,
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
        members: {
          select: { name: true, email: true },
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
        sprints: true,
        issues: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            reporter: { select: { id: true, name: true } },
            subTasks: { orderBy: { createdAt: "asc" } },
            _count: { select: { comments: true } },
          },
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
  const actorId = req.user.userId;

  try {
    const [project] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }),
    ]);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { members: { connect: { id: userId } } },
      include: { members: true },
    });

    // Notify the added member
    if (userId !== actorId) {
      await prisma.notification.create({
        data: {
          userId,
          message: `You have been added to project "${project?.name}"`,
          type: "ASSIGNMENT",
        },
      });
    }

    res.json({ message: "Member added", updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error adding member" });
  }
};

export const removeMemberFromProject = async (req, res) => {
  const { projectId, userId } = req.body;
  const actorId = req.user.userId;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { members: { disconnect: { id: userId } } },
    });

    // Notify the removed member
    if (userId !== actorId) {
      await prisma.notification.create({
        data: {
          userId,
          message: `You have been removed from project "${project?.name}"`,
          type: "HANDOVER",
        },
      });
    }

    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing member" });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project" });
  }
};

export const editProject = async (req, res) => {
  const { id } = req.params;
  const { name, key, description } = req.body;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { key },
    });
    if (existingProject && existingProject.id !== id) {
      return res.status(400).json({ message: "Project key already exists" });
    }
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        key,
        description,
      },
    });
    res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating project" });
  }
};
