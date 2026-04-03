import { prisma } from "@/app/lib/db";

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
}

main()
  .catch((e) => {
    console.error(e, "Error seeding database");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
