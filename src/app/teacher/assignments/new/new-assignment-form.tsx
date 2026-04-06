"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAssignment } from "@/app/actions/assignment-actions";
import { SAMPLE_ASSIGNMENT_JSON } from "@/lib/sample-assignment-json";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Textarea } from "@/libs/components/ui/textarea";

export function NewAssignmentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createAssignment(fd);
      if (res?.ok) router.push(`/teacher/assignments/${res.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bài tập.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" name="title" required placeholder="Unit 1 — Review" />
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="content">Nội dung (JSON mảng câu hỏi)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto py-1"
            onClick={() => {
              const el = document.getElementById("content") as HTMLTextAreaElement | null;
              if (el) el.value = SAMPLE_ASSIGNMENT_JSON;
            }}
          >
            Điền mẫu
          </Button>
        </div>
        <Textarea id="content" name="content" required rows={16} defaultValue={SAMPLE_ASSIGNMENT_JSON} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu…" : "Tạo bài tập"}
      </Button>
    </form>
  );
}
