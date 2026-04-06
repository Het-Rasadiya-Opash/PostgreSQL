import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      select: { 
        id: true, 
        name: true, 
        code: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamCode } = await req.json();

    if (!teamCode) {
      return NextResponse.json({ error: "Team code is required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { code: teamCode },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid team code" }, { status: 404 });
    }

    // Update user's teamId
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { teamId: team.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teamId: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully joined team ${team.name}`,
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
