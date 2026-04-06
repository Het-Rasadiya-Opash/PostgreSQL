import { prisma } from "../db/db.config.js";

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const findUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (findUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
  res.status(201).json({
    message: "User created successfully",
    user,
  });
};

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  const user = await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      name,
      email,
      password,
    },
  });

  res.status(200).json({
    message: "User updated successfully",
    user,
  });
};

export const getAllUsers = async (_, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json({
    message: "Users fetched successfully",
    users,
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });
  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  await prisma.user.delete({
    where: {
      id: Number(userId),
    },
  });
  res.status(200).json({
    message: "User deleted successfully",
  });
};
  