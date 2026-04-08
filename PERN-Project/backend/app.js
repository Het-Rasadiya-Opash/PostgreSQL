import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { checkDatabaseConnection } from "./config/db.js";
const app = express();
const PORT = process.env.PORT;

checkDatabaseConnection();

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
