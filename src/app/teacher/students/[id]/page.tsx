import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/libs/components/ui/card";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherStudentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const student = await prisma.user.findFirst({
    where: { id, isAdmin: false },
    include: {
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: { assignment: { select: { title: true } } },
      },
    },
  });
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/teacher/students" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← Danh sách học sinh
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{student.username}</h1>
      </div>

      <h2 className="text-lg font-semibold">Bảng điểm / bài đã nộp</h2>
      <ul className="space-y-4">
        {student.submissions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">Chưa có bài nộp.</CardContent>
          </Card>
        ) : (
          student.submissions.map((sub) => {
            const details = sub.details as unknown as GradingDetailRow[];
            const wrong = details.filter((d) => !d.isCorrect);
            return (
              <li key={sub.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{sub.assignment.title}</CardTitle>
                    <p className="text-sm text-zinc-500">
                      Điểm: <span className="font-medium text-zinc-900 dark:text-zinc-100">{sub.score.toFixed(1)}</span>{" "}
                      · {new Date(sub.submittedAt).toLocaleString("vi-VN")}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Chi tiết</p>
                    <ul className="list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
                      {details.map((d) => (
                        <li key={d.questionId}>
                          {d.questionId}: {d.isCorrect ? "Đúng" : "Sai"} — trả lời: &quot;{d.studentAnswer || "—"}&quot;
                          {!d.isCorrect && d.explain ? (
                            <span className="block pl-4 text-zinc-500">Gợi ý: {d.explain}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {wrong.length === 0 ? (
                      <p className="text-emerald-600 dark:text-emerald-400">Tất cả câu đúng.</p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
