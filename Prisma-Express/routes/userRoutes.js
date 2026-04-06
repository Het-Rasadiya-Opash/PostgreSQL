import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controller/userController.js";

const router = express.Router();

router.post("/", createUser);
router.put("/:userId", updateUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.delete("/:userId", deleteUser);

export default router;
