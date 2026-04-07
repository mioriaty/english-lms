import Link from "next/link";
import { prisma } from "@/libs/utils/db";
import { Button } from "@/libs/components/ui/button";
import { Badge } from "@/libs/components/ui/badge";
import { LectureDeleteButton } from "./_components/lecture-delete-button";
import { LectureToggle } from "./_components/lecture-toggle";

export default async function TeacherLecturesPage() {
  const lectures = await prisma.lecture.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, isPublished: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lectures</h1>
          <p className="text-xl text-muted-foreground">Manage all lectures.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/lectures/new">New Lecture</Link>
        </Button>
      </div>

      {lectures.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-xl text-zinc-500">
          No lectures found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-xl">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {lectures.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/teacher/lectures/${l.id}/edit`}
                      className="hover:underline"
                    >
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={l.isPublished ? "default" : "secondary"}>
                      {l.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <LectureToggle id={l.id} isPublished={l.isPublished} />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/lectures/${l.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <LectureDeleteButton id={l.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
