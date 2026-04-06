"use client";

import { useState } from "react";
import { updateAssignment } from "@/app/actions/assignment-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { QuestionBuilder } from "@/app/teacher/assignments/question-builder";
import type { Question } from "@/core/lms/domain/question.types";

interface EditAssignmentFormProps {
  assignmentId: string;
  initialTitle: string;
  initialContent: string; // JSON string của Question[]
  initialTimeLimitSeconds: number | null;
}

export function EditAssignmentForm({
  assignmentId,
  initialTitle,
  initialContent,
  initialTimeLimitSeconds,
}: EditAssignmentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [timeLimit, setTimeLimit] = useState<string>(
    initialTimeLimitSeconds ? String(Math.round(initialTimeLimitSeconds / 60)) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  // Parse initial questions — fallback về empty nếu lỗi
  const initialQuestions: Question[] = (() => {
    try {
      return JSON.parse(initialContent) as Question[];
    } catch {
      return [];
    }
  })();

  async function handleSubmit(questions: Question[]) {
    setError(null);
    setOk(false);
    if (!title.trim()) {
      setError("Tiêu đề bắt buộc.");
      return;
    }
    if (questions.length === 0) {
      setError("Cần ít nhất 1 câu hỏi.");
      return;
    }
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
      await updateAssignment(assignmentId, fd);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được.");
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
      {ok ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          Đã lưu thay đổi.
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
        <QuestionBuilder
          onSubmit={handleSubmit}
          initialQuestions={initialQuestions}
        />
      </div>

      {pending && (
        <p className="text-sm text-zinc-500">Đang lưu…</p>
      )}
    </div>
  );
}
