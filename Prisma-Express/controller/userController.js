import { prisma } from "../db/db.config.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (findUser) return res.status(400).json({ message: "User already exists" });

    const user = await prisma.user.create({ data: { name, email, password } });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (_, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await prisma.user.update({
      where: { id: Number(req.params.userId) },
      data: { name, email, password },
    });
    res.status(200).json({ message: "User updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.delete({ where: { id: Number(req.params.userId) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
