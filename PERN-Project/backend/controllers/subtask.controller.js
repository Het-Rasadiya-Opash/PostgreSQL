import { prisma } from "../config/db.js";

export const createSubTask = async (req, res) => {
  const { issueId } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  try {
    const subTask = await prisma.subTask.create({
      data: { title, issueId },
    });
    res.status(201).json({ message: "SubTask created", subTask });
  } catch (error) {
    res.status(500).json({ message: "Error creating subtask" });
  }
};

export const toggleSubTask = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.subTask.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ message: "SubTask not found" });

    const subTask = await prisma.subTask.update({
      where: { id },
      data: { isCompleted: !existing.isCompleted },
    });

    // Auto-mark issue DONE if all subtasks completed, else revert to IN_PROGRESS
    const allSubTasks = await prisma.subTask.findMany({
      where: { issueId: existing.issueId },
    });
    const allDone = allSubTasks.every((s) => s.isCompleted);
    await prisma.issue.update({
      where: { id: existing.issueId },
      data: { status: allDone ? "DONE" : "IN_PROGRESS" },
    });

    res.json({ message: "SubTask updated", subTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating subtask" });
  }
};

export const deleteSubTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.subTask.delete({ where: { id } });
    res.json({ message: "SubTask deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subtask" });
  }
};
