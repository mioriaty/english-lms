import Link from "next/link";
import { prisma } from "@/libs/utils/db";
import { Button } from "@/libs/components/ui/button";
import { Badge } from "@/libs/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/libs/components/ui/table";
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
          <h1 className="text-xl font-bold tracking-tight">Lectures</h1>
          <p className="text-muted-foreground">Manage all lectures.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/lectures/new">New Lecture</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No lectures yet.
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <Link href={`/teacher/lectures/${l.id}`}>
                      {l.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.isPublished ? "default" : "secondary"}>
                      {l.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <LectureToggle id={l.id} isPublished={l.isPublished} />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/lectures/${l.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <LectureDeleteButton id={l.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
