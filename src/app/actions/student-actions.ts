"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/libs/utils/db";

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

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: studentId, isAdmin: false } });
  revalidatePath("/teacher/students");
}

export async function updateStudent(
  studentId: string,
  data: { username?: string; password?: string },
) {
  await requireAdmin();

  const updateData: { username?: string; passwordHash?: string } = {};

  if (data.username) {
    updateData.username = data.username.trim();
  }
  if (data.password) {
    updateData.passwordHash = await hash(data.password, 10);
  }

  if (Object.keys(updateData).length === 0) return;

  try {
    await prisma.user.update({
      where: { id: studentId, isAdmin: false },
      data: updateData,
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
