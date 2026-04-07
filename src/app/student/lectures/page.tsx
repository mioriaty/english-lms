import Link from "next/link";
import { prisma } from "@/libs/utils/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";

export default async function StudentLecturesPage() {
  const lectures = await prisma.lecture.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Lectures</h1>
        <p className="mt-1 text-xl text-zinc-600 dark:text-zinc-400">
          List of lectures.
        </p>
      </div>

      <ul className="space-y-3">
        {lectures.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-500">
              No lectures found.
            </CardContent>
          </Card>
        ) : (
          lectures.map((l) => (
            <li key={l.id}>
              <Link href={`/student/lectures/${l.id}`}>
                <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{l.title}</CardTitle>
                    <p className="text-xl text-zinc-500">
                      {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                    </p>
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
