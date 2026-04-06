import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_TEACHER_USERNAME ?? "teacher";
  const password = process.env.SEED_TEACHER_PASSWORD ?? "teacher123";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log("Teacher already exists:", username);
    return;
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      passwordHash,
      isAdmin: true,
    },
  });

  console.log("Seeded teacher:", username, "| password:", password);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
