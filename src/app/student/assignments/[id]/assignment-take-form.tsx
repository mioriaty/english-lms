"use client";

import { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import type { Question } from "@/core/lms/domain/question.types";
import { Button } from "@/libs/components/ui/button";
import { useCountdown } from "./_hooks/use-countdown";
import { useAssignmentForm } from "./_hooks/use-assignment-form";
import { CountdownBadge } from "./_components/countdown-badge";
import { QuestionCard } from "./_components/question-card";
import { ResultCard } from "./_components/result-card";

interface AssignmentTakeFormProps {
  assignmentId: string;
  title: string;
  description: string | null;
  image: string | null;
  questions: Question[];
  timeLimitSeconds: number | null;
}

export function AssignmentTakeForm({
  assignmentId,
  title,
  description,
  image,
  questions,
  timeLimitSeconds,
}: AssignmentTakeFormProps) {
  const [lightbox, setLightbox] = useState(false);

  const {
    answers,
    setAnswers,
    result,
    pending,
    submitted,
    toggleOption,
    doSubmit,
    onSubmit,
  } = useAssignmentForm(assignmentId);

  const remaining = useCountdown(submitted ? null : timeLimitSeconds, () =>
    doSubmit(answers)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-zinc-500">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {remaining !== null && !submitted && (
          <CountdownBadge seconds={remaining} />
        )}
      </div>

      {(image || description) && (
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
          {image && (
            <>
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative block w-full overflow-hidden rounded-md"
              >
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-colors group-hover:bg-black/20">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                </div>
              </button>

              {lightbox && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                  onClick={() => setLightbox(false)}
                >
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
                    onClick={() => setLightbox(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <img
                    src={image}
                    alt={title}
                    className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          )}
          {description && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit}>
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            answer={answers[q.id]}
            submitted={submitted}
            result={result}
            onToggleOption={(opt) => toggleOption(q.id, opt)}
            onChangeBlank={(v) =>
              setAnswers((prev) => ({ ...prev, [q.id]: v }))
            }
          />
        ))}

        {!submitted && (
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Grading…" : "Submit"}
          </Button>
        )}
      </form>

      {result && <ResultCard result={result} />}
    </div>
  );
}
