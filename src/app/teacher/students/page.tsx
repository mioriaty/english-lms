import { prisma } from "@/libs/utils/db";
import { CreateStudentForm } from "./create-student-form";
import { StudentsDataTable } from "./students-data-table";

export default async function TeacherStudentsPage() {
  const students = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manually create student login credentials.
        </p>
      </div>

      <CreateStudentForm />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Students</h2>
        <StudentsDataTable students={students} />
      </div>
    </div>
  );
}
