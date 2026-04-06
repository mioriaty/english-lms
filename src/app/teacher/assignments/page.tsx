import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/libs/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/libs/components/ui/card";
import { AssignmentToggle } from "./assignment-toggle";

export default async function TeacherAssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bài tập</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Nội dung câu hỏi lưu dạng JSON.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/assignments/new">Tạo mới</Link>
        </Button>
      </div>

      <ul className="space-y-3">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">Chưa có bài tập.</CardContent>
          </Card>
        ) : (
          assignments.map((a) => (
            <li key={a.id}>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                    <p className="mt-1 text-sm text-zinc-500">
                      {a._count.submissions} lượt nộp · {a.isActive ? "Đang mở" : "Đã đóng"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AssignmentToggle id={a.id} isActive={a.isActive} />
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/teacher/assignments/${a.id}/edit`}>Sửa</Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
