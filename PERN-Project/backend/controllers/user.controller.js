import { prisma } from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving users",
      error: error.message,
    });
  }
};
