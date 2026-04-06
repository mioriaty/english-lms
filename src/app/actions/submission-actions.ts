"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  gradeSubmission,
  parseAssignmentQuestions,
} from "@/core/lms/application/grade-submission";
import { prisma } from "@/lib/db";

export async function submitAssignment(assignmentId: string, answers: Record<string, string>) {
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
