import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/libs/utils/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";
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
        <Link
          href="/teacher/students"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          ← Students
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {student.username}
        </h1>
      </div>

      <h2 className="text-lg font-semibold">Grade Sheet / Submissions</h2>
      <ul className="space-y-4">
        {student.submissions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No submissions yet.
            </CardContent>
          </Card>
        ) : (
          student.submissions.map((sub) => {
            const details = sub.details as unknown as GradingDetailRow[];
            const allCorrect = details.every((d) => d.isCorrect);
            const correctCount = details.filter((d) => d.isCorrect).length;

            return (
              <li key={sub.id}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {sub.assignment.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                      <span>
                        Score:{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {sub.score.toFixed(0)}%
                        </span>{" "}
                        ({correctCount}/{details.length} correct)
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(sub.submittedAt).toLocaleString("en-US")}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {allCorrect ? (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        ✓ All correct!
                      </p>
                    ) : null}

                    <ul className="space-y-3">
                      {details.map((d, idx) => (
                        <li
                          key={d.questionId}
                          className={`rounded-lg border p-3 text-sm ${
                            d.isCorrect
                              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                              : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                          }`}
                        >
                          {/* Question */}
                          <p className="font-medium text-zinc-700 dark:text-zinc-200">
                            <span className="mr-2 text-xs text-zinc-400">
                              Q{idx + 1}
                            </span>
                            {d.questionText ?? (
                              <span className="italic text-zinc-400">—</span>
                            )}
                          </p>

                          {/* Student answer */}
                          <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-1 text-xs">
                            <span>
                              <span className="text-zinc-400">Answered: </span>
                              <span
                                className={`font-medium ${
                                  d.isCorrect
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-red-700 dark:text-red-300"
                                }`}
                              >
                                &quot;{d.studentAnswer || "—"}&quot;
                              </span>
                              {d.isCorrect ? (
                                <span className="ml-1 text-emerald-600">✓</span>
                              ) : (
                                <span className="ml-1 text-red-500">✗</span>
                              )}
                            </span>

                            {/* Correct answer (only if wrong) */}
                            {!d.isCorrect &&
                            d.correctAnswers &&
                            d.correctAnswers.length > 0 ? (
                              <span>
                                <span className="text-zinc-400">Correct: </span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                  {d.correctAnswers.join(" / ")}
                                </span>
                              </span>
                            ) : null}
                          </div>

                          {/* Explanation */}
                          {!d.isCorrect && d.explain ? (
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                              💡 {d.explain}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
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
