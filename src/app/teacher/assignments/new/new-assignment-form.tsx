"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAssignment } from "@/app/actions/assignment-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { QuestionBuilder } from "@/app/teacher/assignments/question-builder";
import type { Question } from "@/core/lms/domain/question.types";

export function NewAssignmentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(questions: Question[]) {
    setError(null);
    if (!title.trim()) {
      setError("Tiêu đề bắt buộc.");
      return;
    }
    if (questions.length === 0) {
      setError("Cần ít nhất 1 câu hỏi.");
      return;
    }

    // Validate: mỗi câu hỏi phải có ít nhất 1 đáp án đúng
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correct.length === 0) {
        setError(`Câu ${i + 1} chưa có đáp án đúng.`);
        return;
      }
      if (!questions[i].question.text.trim()) {
        setError(`Câu ${i + 1} chưa có nội dung câu hỏi.`);
        return;
      }
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", JSON.stringify(questions));
      const timeLimitMinutes = timeLimit.trim() ? Number(timeLimit) : null;
      if (timeLimitMinutes !== null)
        fd.append("timeLimitSeconds", String(timeLimitMinutes * 60));
      const res = await createAssignment(fd);
      if (res?.ok) router.push(`/teacher/assignments/${res.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bài tập.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {/* Tiêu đề + Thời gian */}
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Unit 1 — Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeLimit">
            Giới hạn thời gian{" "}
            <span className="font-normal text-zinc-400">(phút, tuỳ chọn)</span>
          </Label>
          <Input
            id="timeLimit"
            type="number"
            min={1}
            max={300}
            placeholder="Không giới hạn"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
      </div>

      {/* Question builder */}
      <div className="space-y-2">
        <Label>Câu hỏi</Label>
        <QuestionBuilder onSubmit={handleSubmit} />
      </div>

      {pending && <p className="text-sm text-zinc-500">Đang lưu bài tập…</p>}
    </div>
  );
}
