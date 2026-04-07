"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { parseAssignmentQuestions } from "@/core/lms/application/grade-submission";
import { prisma } from "@/libs/utils/db";
import { deleteAudioFile, deleteImageFile, extractAudioUrls } from "@/libs/utils/file-storage";
import type { Question } from "@/core/lms/domain/question.types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createAssignment(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;
  const contentRaw = String(formData.get("content") ?? "");
  const timeLimitRaw = formData.get("timeLimitSeconds");
  const timeLimitSeconds = timeLimitRaw ? Number(timeLimitRaw) : null;
  if (!title) throw new Error("Tiêu đề bắt buộc");
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    throw new Error("JSON không hợp lệ");
  }
  const content = parseAssignmentQuestions(parsed);
  const assignment = await prisma.assignment.create({
    data: { title, description, image, content: content as object, timeLimitSeconds },
  });
  revalidatePath("/teacher/assignments");
  return { ok: true as const, id: assignment.id };
}

export async function updateAssignment(
  assignmentId: string,
  formData: FormData,
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;
  const contentRaw = String(formData.get("content") ?? "");
  const timeLimitRaw = formData.get("timeLimitSeconds");
  const timeLimitSeconds = timeLimitRaw ? Number(timeLimitRaw) : null;
  if (!title) throw new Error("Tiêu đề bắt buộc");
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    throw new Error("JSON không hợp lệ");
  }
  const content = parseAssignmentQuestions(parsed);

  const existing = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (existing) {
    const oldUrls = extractAudioUrls(existing.content as unknown as Question[]);
    const newUrls = new Set(extractAudioUrls(content));
    await Promise.all(oldUrls.filter((u) => !newUrls.has(u)).map(deleteAudioFile));

    if (existing.image && existing.image !== image) {
      await deleteImageFile(existing.image);
    }
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { title, description, image, content: content as object, timeLimitSeconds },
  });
  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${assignmentId}/edit`);
}

export async function setAssignmentActive(
  assignmentId: string,
  isActive: boolean,
) {
  await requireAdmin();
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { isActive },
  });
  revalidatePath("/teacher/assignments");
}

export async function deleteAssignment(assignmentId: string) {
  await requireAdmin();
  const existing = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (existing) {
    const audioUrls = extractAudioUrls(existing.content as unknown as Question[]);
    await Promise.all(audioUrls.map(deleteAudioFile));
    if (existing.image) await deleteImageFile(existing.image);
  }
  await prisma.assignment.delete({ where: { id: assignmentId } });
  revalidatePath("/teacher/assignments");
}
