"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAssignment } from "@/app/actions/assignment-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { QuestionBuilder } from "@/app/teacher/assignments/question-builder";
import type { Question } from "@/core/lms/domain/question.types";

interface EditAssignmentFormProps {
  assignmentId: string;
  initialTitle: string;
  initialContent: string;
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
    initialTimeLimitSeconds ? String(Math.round(initialTimeLimitSeconds / 60)) : "",
  );
  const [pending, setPending] = useState(false);

  const initialQuestions: Question[] = (() => {
    try {
      return JSON.parse(initialContent) as Question[];
    } catch {
      return [];
    }
  })();

  async function handleSubmit(questions: Question[]) {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (questions.length === 0) {
      toast.error("At least 1 question required.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correct.length === 0) {
        toast.error(`Question ${i + 1} has no correct answer.`);
        return;
      }
      if (!questions[i].question.text.trim()) {
        toast.error(`Question ${i + 1} has no question text.`);
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
      toast.success("Changes saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update assignment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_300px]">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
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
            Time limit{" "}
            <span className="font-normal text-zinc-400">(minutes, optional)</span>
          </Label>
          <Input
            id="timeLimit"
            type="number"
            min={1}
            max={300}
            placeholder="No limit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Questions</Label>
        <QuestionBuilder onSubmit={handleSubmit} initialQuestions={initialQuestions} />
      </div>

      {pending && <p className="text-sm text-zinc-500">Saving…</p>}
    </div>
  );
}
