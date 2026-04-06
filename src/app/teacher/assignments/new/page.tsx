import Link from "next/link";
import { NewAssignmentForm } from "./new-assignment-form";

export default function NewAssignmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/teacher/assignments" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← Danh sách bài tập
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tạo bài tập</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Mỗi phần tử có{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">MULTIPLE_CHOICE</code> hoặc{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">FILL_IN_THE_BLANK</code>.
        </p>
      </div>
      <NewAssignmentForm />
    </div>
  );
}
