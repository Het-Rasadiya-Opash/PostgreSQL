import { checkUserPermissions, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !checkUserPermissions(currentUser, Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 },
      );
    }

    const { role } = await request.json();

    const validRoles = [Role.USER, Role.MANAGER];

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role
      },
      include: {
        team: true,
      },
    });
    return NextResponse.json(
      {
        user: updatedUser,
        message: "User role updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error role:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found.")
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
