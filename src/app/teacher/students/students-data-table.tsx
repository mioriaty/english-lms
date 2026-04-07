"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/libs/components/ui/table";
import { Button } from "@/libs/components/ui/button";
import { EditStudentSheet } from "./edit-student-sheet";
import { DeleteStudentButton } from "./delete-student-button";

interface Student {
  id: string;
  username: string;
  createdAt: Date;
  _count: { submissions: number };
}

interface StudentsDataTableProps {
  students: Student[];
}

export function StudentsDataTable({ students }: StudentsDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No students yet.
              </TableCell>
            </TableRow>
          ) : (
            students.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.username}</TableCell>
                <TableCell>
                  {s._count.submissions}{" "}
                  {s._count.submissions === 1 ? "submission" : "submissions"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teacher/students/${s.id}`}>View</Link>
                    </Button>
                    <EditStudentSheet student={s} />
                    <DeleteStudentButton student={s} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
