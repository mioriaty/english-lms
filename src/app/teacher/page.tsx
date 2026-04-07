import Link from "next/link";
import { prisma } from "@/libs/utils/db";
import { Button } from "@/libs/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";

export default async function TeacherHomePage() {
  const [assignmentCount, lectureCount, studentCount, submissionCount] =
    await Promise.all([
      prisma.assignment.count(),
      prisma.lecture.count(),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.submission.count(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Manage assignments and students.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assignments</CardDescription>
            <CardTitle className="text-3xl">{assignmentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lectures</CardDescription>
            <CardTitle className="text-3xl">{lectureCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-3xl">{studentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submissions</CardDescription>
            <CardTitle className="text-3xl">{submissionCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/teacher/assignments/new">New Assignment</Link>
        </Button>

        <Button variant="secondary" asChild>
          <Link href="/teacher/students">Add Student</Link>
        </Button>

        <Button variant="secondary" asChild>
          <Link href="/teacher/lectures/new">New Lecture</Link>
        </Button>
      </div>
    </div>
  );
}
