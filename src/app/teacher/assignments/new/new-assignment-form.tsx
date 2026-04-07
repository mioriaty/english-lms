"use client";

import { createAssignment } from "@/app/actions/assignment-actions";
import { ImageUploader } from "@/app/teacher/assignments/_components/image-uploader";
import { QuestionBuilder } from "@/app/teacher/assignments/question-builder";
import type { Question } from "@/core/lms/domain/question.types";
import { RichTextEditor } from "@/libs/components/rich-text-editor";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewAssignmentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState("");
  const [pending, setPending] = useState(false);

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
      const q = questions[i];
      if (!q.question.text.trim() && q.type !== "GROUP") {
        toast.error(`Question ${i + 1} has no question text.`);
        return;
      }
      if (q.type === "GROUP") {
        if (q.subQuestions.length === 0) {
          toast.error(`Group ${i + 1} has no sub-questions.`);
          return;
        }
        for (let j = 0; j < q.subQuestions.length; j++) {
          const sub = q.subQuestions[j];
          if (!sub.question.text.trim()) {
            toast.error(`Question ${i + 1}.${j + 1} has no question text.`);
            return;
          }
          if (sub.correct.length === 0) {
            toast.error(`Question ${i + 1}.${j + 1} has no correct answer.`);
            return;
          }
        }
      } else {
        if (q.correct.length === 0) {
          toast.error(`Question ${i + 1} has no correct answer.`);
          return;
        }
      }
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      if (description.trim()) fd.append("description", description.trim());
      if (image) fd.append("image", image);
      fd.append("content", JSON.stringify(questions));
      const timeLimitMinutes = timeLimit.trim() ? Number(timeLimit) : null;
      if (timeLimitMinutes !== null)
        fd.append("timeLimitSeconds", String(timeLimitMinutes * 60));
      const res = await createAssignment(fd);
      if (res?.ok) router.push(`/teacher/assignments/${res.id}/edit`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create assignment."
      );
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
            placeholder="Unit 1 — Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeLimit">
            Time limit{" "}
            <span className="font-normal text-zinc-400">
              (minutes, optional)
            </span>
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
        <Label>
          Description{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Mô tả bài tập, hướng dẫn…"
        />
      </div>

      <ImageUploader imageUrl={image} onChange={setImage} />

      <div className="space-y-2">
        <Label>Questions</Label>
        <QuestionBuilder onSubmit={handleSubmit} />
      </div>

      {pending && <p className="text-xl text-zinc-500">Saving…</p>}
    </div>
  );
}
