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
import { Badge } from "@/libs/components/ui/badge";
import { Button } from "@/libs/components/ui/button";
import { AssignmentToggle } from "./assignment-toggle";
import { AssignmentDeleteButton } from "./assignment-delete-button";

interface Assignment {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: Date;
  _count: { submissions: number };
}

interface AssignmentsDataTableProps {
  assignments: Assignment[];
}

export function AssignmentsDataTable({
  assignments,
}: AssignmentsDataTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No assignments yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">
                <Link href={`/teacher/assignments/${a.id}/edit`}>
                  {a.title}
                </Link>
              </TableCell>
              <TableCell>{a._count.submissions}</TableCell>
              <TableCell>
                <Badge variant={a.isActive ? "default" : "secondary"}>
                  {a.isActive ? "Open" : "Closed"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <AssignmentToggle id={a.id} isActive={a.isActive} />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teacher/assignments/${a.id}/edit`}>Edit</Link>
                  </Button>
                  <AssignmentDeleteButton id={a.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
