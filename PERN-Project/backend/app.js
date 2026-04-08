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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
