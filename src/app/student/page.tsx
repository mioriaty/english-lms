import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/libs/components/ui/card";

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
        select: { score: true, submittedAt: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Open Assignments</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Choose an assignment to start. You can submit multiple times.</p>
      </div>

      <ul className="space-y-3">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">No assignments available.</CardContent>
          </Card>
        ) : (
          assignments.map((a) => {
            const last = a.submissions[0];
            return (
              <li key={a.id}>
                <Link href={`/student/assignments/${a.id}`}>
                  <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{a.title}</CardTitle>
                      {last ? (
                        <p className="text-sm text-zinc-500">
                          Last attempt: {last.score.toFixed(1)} pts ·{" "}
                          {new Date(last.submittedAt).toLocaleString("en-US")}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500">Not attempted</p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
