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
  const pdfUrl = String(formData.get("pdfUrl") ?? "").trim() || null;
  if (!title) throw new Error("Tiêu đề bắt buộc");

  const lecture = await prisma.lecture.create({
    data: { title, content, isPublished, pdfUrl },
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
  const pdfUrl = String(formData.get("pdfUrl") ?? "").trim() || null;
  if (!title) throw new Error("Tiêu đề bắt buộc");

  await prisma.lecture.update({
    where: { id: lectureId },
    data: { title, content, isPublished, pdfUrl },
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

// ─── Comment Actions ──────────────────────────────────────────────────────────

/**
 * Extracts @mentioned usernames from comment content.
 * e.g. "@alice hello" → ["alice"]
 */
function extractMentions(content: string): string[] {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

export async function createLectureComment(
  lectureId: string,
  content: string,
  parentId?: string | null,
  mediaUrl?: string | null,
  mediaType?: string | null,
  mediaName?: string | null,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const trimmed = content.trim();
  if (!trimmed && !mediaUrl) throw new Error("Nội dung comment hoặc file đính kèm không được để trống");

  // Prevent replying to a reply (enforce 1-level only)
  if (parentId) {
    const parent = await prisma.lectureComment.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });
    if (parent?.parentId) throw new Error("Chỉ được reply 1 cấp");
  }

  const mentionedUsernames = extractMentions(trimmed);

  await prisma.lectureComment.create({
    data: {
      content: trimmed,
      mentionedUsernames,
      lectureId,
      authorId: session.user.id,
      parentId: parentId ?? null,
      mediaUrl,
      mediaType,
      mediaName,
    },
  });

  revalidatePath(`/student/lectures/${lectureId}`);
  revalidatePath(`/teacher/lectures/${lectureId}`);
  return { ok: true as const };
}

export async function deleteLectureComment(
  commentId: string,
  lectureId: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.lectureComment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) throw new Error("Comment không tồn tại");

  const isAdmin = session.user.isAdmin;
  const isOwner = comment.authorId === session.user.id;
  if (!isAdmin && !isOwner) throw new Error("Không có quyền xóa comment này");

  await prisma.lectureComment.delete({ where: { id: commentId } });

  revalidatePath(`/student/lectures/${lectureId}`);
  revalidatePath(`/teacher/lectures/${lectureId}`);
  return { ok: true as const };
}
