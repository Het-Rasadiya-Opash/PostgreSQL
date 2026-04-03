import { checkDatabaseConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { status: "ok", message: "Database is connected" },
    { status: 200 },
  );
}
