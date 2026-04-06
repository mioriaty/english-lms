"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { parseAssignmentQuestions } from "@/core/lms/application/grade-submission";
import { prisma } from "@/lib/db";

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
  const contentRaw = String(formData.get("content") ?? "");
  if (!title) throw new Error("Tiêu đề bắt buộc");
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    throw new Error("JSON không hợp lệ");
  }
  const content = parseAssignmentQuestions(parsed);
  const assignment = await prisma.assignment.create({
    data: { title, content: content as object },
  });
  revalidatePath("/teacher/assignments");
  return { ok: true as const, id: assignment.id };
}

export async function updateAssignment(assignmentId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const contentRaw = String(formData.get("content") ?? "");
  if (!title) throw new Error("Tiêu đề bắt buộc");
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    throw new Error("JSON không hợp lệ");
  }
  const content = parseAssignmentQuestions(parsed);
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { title, content: content as object },
  });
  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${assignmentId}/edit`);
}

export async function setAssignmentActive(assignmentId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { isActive },
  });
  revalidatePath("/teacher/assignments");
}
