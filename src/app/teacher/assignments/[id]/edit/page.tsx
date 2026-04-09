import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/libs/utils/db";
import { EditAssignmentForm } from "./edit-assignment-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssignmentPage({ params }: PageProps) {
  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) notFound();

  const contentStr = JSON.stringify(assignment.content, null, 2);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/assignments"
          className="text-xl text-zinc-600 dark:text-zinc-400"
        >
          ← List of Assignments
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight">
          Edit Assignment
        </h1>
      </div>
      <EditAssignmentForm
        assignmentId={id}
        initialTitle={assignment.title}
        initialDescription={assignment.description}
        initialImage={assignment.image}
        initialContent={contentStr}
        initialTimeLimitSeconds={assignment.timeLimitSeconds}
      />
    </div>
  );
}
