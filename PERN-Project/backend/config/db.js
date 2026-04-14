import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Database connection Successfully...`);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
