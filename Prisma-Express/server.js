import "dotenv/config";
import express from "express";
const app = express();
import userRoutes from "./routes/userRoutes.js";

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
