import Link from "next/link";
import { prisma } from "@/libs/utils/db";
import { Button } from "@/libs/components/ui/button";
import { AssignmentsDataTable } from "./assignments-data-table";

export default async function TeacherAssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all assignments.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/assignments/new">New Assignment</Link>
        </Button>
      </div>

      <AssignmentsDataTable assignments={assignments} />
    </div>
  );
}
