import express from "express";
import {
  getMe,
  getDevelopers,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleBaseAuth.js";
const router = express.Router();

router.get("/", authMiddleware, getMe);
router.get("/developers", authMiddleware, authorizeRole("PROJECT_MANAGER"), getDevelopers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.put("/profile", authMiddleware, updateUser);

export default router;
