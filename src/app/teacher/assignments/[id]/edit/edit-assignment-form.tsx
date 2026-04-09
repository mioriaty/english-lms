"use client";

import { updateAssignment } from "@/app/actions/assignment-actions";
import { ImageUploader } from "@/app/teacher/assignments/_components/image-uploader";
import { QuestionBuilder } from "@/app/teacher/assignments/question-builder";
import type { Question } from "@/core/lms/domain/question.types";
import { RichTextEditor } from "@/libs/components/rich-text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/libs/components/ui/form";
import { Input } from "@/libs/components/ui/input";
import { Button } from "@/libs/components/ui/button";
import { validateQuestions } from "@/core/lms/domain/question-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  timeLimit: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditAssignmentFormProps {
  assignmentId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialImage: string | null;
  initialContent: string;
  initialTimeLimitSeconds: number | null;
}

export function EditAssignmentForm({
  assignmentId,
  initialTitle,
  initialDescription,
  initialImage,
  initialContent,
  initialTimeLimitSeconds,
}: EditAssignmentFormProps) {
  const initialQuestions: Question[] = (() => {
    try {
      return JSON.parse(initialContent) as Question[];
    } catch {
      return [];
    }
  })();

  const questionsRef = useRef<Question[]>(initialQuestions);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription ?? "",
      image: initialImage,
      timeLimit: initialTimeLimitSeconds
        ? String(Math.round(initialTimeLimitSeconds / 60))
        : "",
    },
  });

  // Mark dirty when form values change
  useEffect(() => {
    const sub = form.watch(() => setIsDirty(true));
    return () => sub.unsubscribe();
  }, [form]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function handleSubmit(values: FormValues) {
    const questions = questionsRef.current;
    const validationError = validateQuestions(questions);
    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", values.title.trim());
      if (values.description?.trim()) fd.append("description", values.description.trim());
      if (values.image) fd.append("image", values.image);
      fd.append("content", JSON.stringify(questions));
      const timeLimitMinutes = values.timeLimit?.trim() ? Number(values.timeLimit) : null;
      if (timeLimitMinutes !== null)
        fd.append("timeLimitSeconds", String(timeLimitMinutes * 60));
      await updateAssignment(assignmentId, fd);
      setIsDirty(false);
      toast.success("Changes saved.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update assignment."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-[1fr_300px]">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Time limit{" "}
                    <span className="font-normal text-zinc-400">(minutes, optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={300}
                      placeholder="No limit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description{" "}
                  <span className="font-normal text-zinc-400">(optional)</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Mô tả bài tập, hướng dẫn…"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader imageUrl={field.value ?? null} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <QuestionBuilder
            initialQuestions={initialQuestions}
            onQuestionsChange={(questions) => {
              questionsRef.current = questions;
              setIsDirty(true);
            }}
          />
        </div>

        {/* Sticky save bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            {isDirty ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">Unsaved changes</p>
            ) : (
              <p className="text-sm text-zinc-400">All changes saved</p>
            )}
            <Button type="submit" disabled={isSaving || !isDirty}>
              {isSaving ? "Saving…" : "Save Assignment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
