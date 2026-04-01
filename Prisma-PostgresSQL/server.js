import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { prisma } from "./src/config/db.js";
const app = express();

app.use(express.json());

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
