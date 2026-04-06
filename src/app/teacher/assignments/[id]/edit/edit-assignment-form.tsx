"use client";

import { useState } from "react";
import { updateAssignment } from "@/app/actions/assignment-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Textarea } from "@/libs/components/ui/textarea";

interface EditAssignmentFormProps {
  assignmentId: string;
  initialTitle: string;
  initialContent: string;
}

export function EditAssignmentForm({ assignmentId, initialTitle, initialContent }: EditAssignmentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateAssignment(assignmentId, fd);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Đã lưu.</p> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" name="title" required defaultValue={initialTitle} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Nội dung (JSON)</Label>
        <Textarea id="content" name="content" required rows={18} defaultValue={initialContent} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
