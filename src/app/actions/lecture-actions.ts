"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/libs/utils/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");
}

export async function createLecture(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const isPublished = formData.get("isPublished") === "true";
  if (!title) throw new Error("Tiêu đề bắt buộc");

  const lecture = await prisma.lecture.create({
    data: { title, content, isPublished },
  });
  revalidatePath("/teacher/lectures");
  revalidatePath("/student/lectures");
  return { ok: true as const, id: lecture.id };
}

export async function updateLecture(lectureId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const isPublished = formData.get("isPublished") === "true";
  if (!title) throw new Error("Tiêu đề bắt buộc");

  await prisma.lecture.update({
    where: { id: lectureId },
    data: { title, content, isPublished },
  });
  revalidatePath("/teacher/lectures");
  revalidatePath(`/teacher/lectures/${lectureId}/edit`);
  revalidatePath("/student/lectures");
}

export async function setLecturePublished(lectureId: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.lecture.update({
    where: { id: lectureId },
    data: { isPublished },
  });
  revalidatePath("/teacher/lectures");
}

export async function deleteLecture(lectureId: string) {
  await requireAdmin();
  await prisma.lecture.delete({ where: { id: lectureId } });
  revalidatePath("/teacher/lectures");
}
