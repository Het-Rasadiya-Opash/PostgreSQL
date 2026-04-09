import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { checkDatabaseConnection } from "./config/db.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandlder.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT;

import userRouter from "./routes/user.route.js";
import projectRouter from "./routes/project.route.js";
import issueRouter from "./routes/issue.route.js";
import sprintRouter from "./routes/sprint.route.js";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

checkDatabaseConnection();

app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/issues", issueRouter);
app.use("/api/sprints", sprintRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
