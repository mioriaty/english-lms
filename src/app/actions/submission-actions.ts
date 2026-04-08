"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  gradeSubmission,
  parseAssignmentQuestions,
} from "@/core/lms/application/grade-submission";
import { prisma } from "@/libs/utils/db";

export async function submitAssignment(
  assignmentId: string,
  answers: Record<string, string | string[]>,
) {
  const session = await auth();
  if (!session?.user || session.user.isAdmin) {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || !assignment.isActive) {
    throw new Error("Bài tập không khả dụng");
  }

  const questions = parseAssignmentQuestions(assignment.content);
  const { score, details } = gradeSubmission(questions, answers);

  await prisma.submission.create({
    data: {
      studentId: session.user.id,
      assignmentId,
      score,
      details: details as object,
    },
  });

  revalidatePath("/student");
  revalidatePath(`/student/assignments/${assignmentId}`);

  return { score, details };
}

export async function upsertSubmissionFeedback(
  submissionId: string,
  feedback: string,
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, studentId: true, assignmentId: true },
  });
  if (!submission) throw new Error("Submission not found");

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      feedback: feedback.trim() || null,
      feedbackAt: feedback.trim() ? new Date() : null,
    },
  });

  revalidatePath(`/teacher/students/${submission.studentId}`);
  revalidatePath(`/student/submissions/${submissionId}`);
}
