import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
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

export default async function StudentSubmissionReviewPage({
  params,
}: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: { select: { title: true, id: true } } },
  });

  if (!submission || submission.studentId !== session.user.id) notFound();

  const details = submission.details as unknown as GradingDetailRow[];
  // Tally individual blanks for accurate score display
  const { correctUnits, totalUnits } = details.reduce(
    (acc, d) => {
      if (d.totalBlanks !== undefined && d.correctBlanks !== undefined) {
        acc.totalUnits += d.totalBlanks;
        acc.correctUnits += d.correctBlanks;
      } else {
        acc.totalUnits += 1;
        if (d.isCorrect) acc.correctUnits += 1;
      }
      return acc;
    },
    { correctUnits: 0, totalUnits: 0 },
  );
  const allCorrect = correctUnits === totalUnits;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student"
          className="text-xl text-zinc-600 dark:text-zinc-400"
        >
          ← List of Assignments
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight">
          {submission.assignment.title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xl text-zinc-500">
          <span>
            Score:{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {submission.score.toFixed(0)}%
            </span>{" "}
            ({correctUnits}/{totalUnits} correct)
          </span>
          <span>·</span>
          <span>
            {new Date(submission.submittedAt).toLocaleString("en-US")}
          </span>
        </div>
      </div>

      {/* Teacher Feedback */}
      {submission.feedback && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800 dark:text-blue-300">
              Teacher Feedback
            </CardTitle>
            {submission.feedbackAt && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {new Date(submission.feedbackAt).toLocaleString("en-US")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-blue-900 dark:text-blue-100">
              {submission.feedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grade breakdown */}
      <div className="space-y-3">
        {allCorrect ? (
          <p className="font-medium text-emerald-600 dark:text-emerald-400">
            🎉 Congratulations — all correct!
          </p>
        ) : null}

        <ul className="space-y-3">
          {details.map((d, idx) => (
            <li
              key={d.questionId}
              className={`rounded-lg border p-3 text-xl ${
                d.isCorrect
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
              }`}
            >
              <div className="font-medium text-zinc-700 dark:text-zinc-200">
                <span className="mr-2 text-xs text-zinc-400">Q{idx + 1}</span>
                {d.questionText ? (
                  <span
                    className="prose prose-zinc prose-xl dark:prose-invert max-w-none inline"
                    dangerouslySetInnerHTML={{ __html: d.questionText }}
                  />
                ) : (
                  <span className="italic text-zinc-400">—</span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-xs">
                {d.blankResults ? (
                  // Fill-in-the-blank: show each blank independently
                  d.blankResults.map((r, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-x-2">
                      <span className="text-zinc-400">Blank {i + 1}:</span>
                      <span
                        className={`font-medium ${
                          r.isCorrect
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        &quot;{r.studentAnswer || "—"}&quot;
                      </span>
                      {r.isCorrect ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <>
                          <span className="text-red-500">✗</span>
                          <span className="text-zinc-400">→</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {r.correctAnswers.join(" / ")}
                          </span>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-wrap items-start gap-x-6 gap-y-1">
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
                )}
              </div>

              {!d.isCorrect && d.explain ? (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  💡{" "}
                  <span
                    className="prose prose-zinc prose-sm dark:prose-invert max-w-none inline"
                    dangerouslySetInnerHTML={{ __html: d.explain }}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
