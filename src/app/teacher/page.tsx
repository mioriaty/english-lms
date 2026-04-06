import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/libs/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/libs/components/ui/card";

export default async function TeacherHomePage() {
  const [assignmentCount, studentCount, submissionCount] = await Promise.all([
    prisma.assignment.count(),
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.submission.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Xin chào</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Quản lý bài tập và học sinh.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài tập</CardDescription>
            <CardTitle className="text-3xl">{assignmentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Học sinh</CardDescription>
            <CardTitle className="text-3xl">{studentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài đã nộp</CardDescription>
            <CardTitle className="text-3xl">{submissionCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/teacher/assignments/new">Tạo bài tập</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/teacher/students">Thêm học sinh</Link>
        </Button>
      </div>
    </div>
  );
}
