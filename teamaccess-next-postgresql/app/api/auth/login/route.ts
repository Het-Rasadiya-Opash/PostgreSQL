import { generateToken, hashPassword, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userFromDb = await prisma.user.findUnique({
      where: {
        email,
      },
      include: { team: true },
    });

    if (!userFromDb) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await verifyPassword(password, userFromDb.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const token = generateToken(userFromDb.id);

    const response = NextResponse.json({
      user: {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        role: userFromDb.role,
        teamId: userFromDb.teamId,
        team: userFromDb.team,
        token,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the Login User request" },
      { status: 500 },
    );
  }
}
