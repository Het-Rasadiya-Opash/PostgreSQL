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
    const user = await getCurrentUser();
    if (!user || !checkUserPermissions(user, Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { teamId } = await request.json();

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        teamId: teamId,
      },
      include: {
        team: true,
      },
    });
    return NextResponse.json(
      {
        user: updatedUser,
        message: teamId
          ? "User team updated successfully"
          : "User removed from team successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user team:", error);
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
