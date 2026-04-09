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
import { validateQuestions } from "@/core/lms/domain/question-validation";
import { zodResolver } from "@hookform/resolvers/zod";
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

  async function handleSubmit(values: FormValues, questions: Question[]) {
    const validationError = validateQuestions(questions);
    if (validationError) {
      toast.error(validationError.message);
      return;
    }

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
      toast.success("Changes saved.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update assignment."
      );
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
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

        <div className="space-y-2">
          <QuestionBuilder
            initialQuestions={initialQuestions}
            onSubmit={(questions) =>
              form.handleSubmit((values) => handleSubmit(values, questions))()
            }
          />
        </div>
      </div>
    </Form>
  );
}
