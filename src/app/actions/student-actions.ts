"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function createStudent(formData: FormData) {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const passwordHash = await hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        isAdmin: false,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("Tên đăng nhập đã tồn tại.");
    }
    throw e;
  }
  revalidatePath("/teacher/students");
}
