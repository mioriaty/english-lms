import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/libs/utils/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";

export default async function StudentSubmissionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.user.id },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      score: true,
      submittedAt: true,
      feedback: true,
      feedbackAt: true,
      assignment: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">My Submissions</h1>
        <p className="mt-1 text-xl text-zinc-600 dark:text-zinc-400">
          All your submitted assignments.
        </p>
      </div>

      <ul className="space-y-3">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No submissions yet.
            </CardContent>
          </Card>
        ) : (
          submissions.map((sub) => (
            <li key={sub.id}>
              <Link href={`/student/submissions/${sub.id}`}>
                <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {sub.assignment.title}
                      </CardTitle>
                      {sub.feedback && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          Feedback
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xl text-zinc-500">
                      <span>
                        Score:{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {sub.score.toFixed(0)}%
                        </span>
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(sub.submittedAt).toLocaleString("en-US")}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
