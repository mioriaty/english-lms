import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { parseAssignmentQuestions } from "@/core/lms/application/grade-submission";
import { prisma } from "@/libs/utils/db";
import { AssignmentTakeForm } from "./assignment-take-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssignmentPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || !assignment.isActive) notFound();

  const questions = parseAssignmentQuestions(assignment.content);

  return (
    <div className="space-y-4">
      <Link
        href="/student"
        className="text-xl text-zinc-600 underline dark:text-zinc-400"
      >
        ← Danh sách bài tập
      </Link>
      <AssignmentTakeForm
        assignmentId={id}
        title={assignment.title}
        description={assignment.description}
        image={assignment.image}
        questions={questions}
        timeLimitSeconds={assignment.timeLimitSeconds}
      />
    </div>
  );
}
