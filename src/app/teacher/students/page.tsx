import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/libs/components/ui/card";
import { CreateStudentForm } from "./create-student-form";

export default async function TeacherStudentsPage() {
  const students = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Học sinh</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Tạo thủ công mã đăng nhập và mật khẩu.</p>
      </div>

      <CreateStudentForm />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Danh sách</h2>
        <ul className="space-y-2">
          {students.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-500">Chưa có học sinh.</CardContent>
            </Card>
          ) : (
            students.map((s) => (
              <li key={s.id}>
                <Link href={`/teacher/students/${s.id}`}>
                  <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                      <div>
                        <p className="font-medium">{s.username}</p>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{s._count.submissions} bài đã nộp</p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
