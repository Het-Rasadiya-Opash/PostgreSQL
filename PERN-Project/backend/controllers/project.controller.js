import e from "cors";
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
