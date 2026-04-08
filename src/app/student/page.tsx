import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/libs/utils/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";

export default async function StudentHomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const assignments = await prisma.assignment.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      submissions: {
        where: { studentId: session.user.id },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { id: true, score: true, submittedAt: true, feedback: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Open Assignments</h1>
        <p className="mt-1 text-xl text-zinc-600 dark:text-zinc-400">
          Choose an assignment to start. You can submit multiple times.
        </p>
      </div>

      <ul className="space-y-3">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No assignments available.
            </CardContent>
          </Card>
        ) : (
          assignments.map((a) => {
            const last = a.submissions[0];
            return (
              <li key={a.id}>
                <Card className="relative transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {/* Overlay link covers the whole card */}
                        <Link
                          href={`/student/assignments/${a.id}`}
                          className="before:absolute before:inset-0"
                        >
                          {a.title}
                        </Link>
                      </CardTitle>
                      {last?.feedback && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          Feedback
                        </span>
                      )}
                    </div>
                    {last ? (
                      <div className="flex flex-wrap items-center gap-2 text-xl text-zinc-500">
                        <span>
                          Last attempt: {last.score.toFixed(1)} pts ·{" "}
                          {new Date(last.submittedAt).toLocaleString("en-US")}
                        </span>
                        {/* relative z-10 to sit above the overlay link */}
                        <Link
                          href={`/student/submissions/${last.id}`}
                          className="relative z-10 text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                        >
                          View result
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xl text-zinc-500">Not attempted</p>
                    )}
                  </CardHeader>
                </Card>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
