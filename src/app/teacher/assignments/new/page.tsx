import Link from "next/link";
import { NewAssignmentForm } from "./new-assignment-form";

export default function NewAssignmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/assignments"
          className="text-xl text-zinc-600 underline dark:text-zinc-400"
        >
          ← Assignments
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          New Assignment
        </h1>
        <p className="mt-1 text-xl text-zinc-600 dark:text-zinc-400">
          Each question has type{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            MULTIPLE_CHOICE
          </code>{" "}
          or{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            FILL_IN_THE_BLANK
          </code>
          .
        </p>
      </div>
      <NewAssignmentForm />
    </div>
  );
}
