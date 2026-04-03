import { hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";

async function main() {
  console.log("Seeding database...");
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Team Alpha",
        description: "The first team",
        code: "ALPHA",
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Beta",
        description: "The second team",
        code: "BETA",
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Gamma",
        description: "The third team",
        code: "GAMMA",
      },
    }),
  ]);

  const sampleUsers = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      team: teams[0],
      role: Role.MANAGER,
    },
    {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      team: teams[1],
      role: Role.USER,
    },
    {
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      team: teams[2],
      role: Role.USER,
    },
    {
      name: "David Lee",
      email: "david.lee@example.com",
      team: teams[1],
      role: Role.MANAGER,
    },
  ];
  for (const userData of sampleUsers) {
    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: await hashPassword("123456"),
        role: userData.role,
        teamId: userData.team.id,
      },
    });
  }
  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e, "Error seeding database");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
