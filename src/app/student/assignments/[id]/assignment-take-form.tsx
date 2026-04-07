"use client";

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
  questions: Question[];
  timeLimitSeconds: number | null;
}

export function AssignmentTakeForm({
  assignmentId,
  title,
  questions,
  timeLimitSeconds,
}: AssignmentTakeFormProps) {
  const {
    answers,
    setAnswers,
    result,
    error,
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
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {remaining !== null && !submitted && (
          <CountdownBadge seconds={remaining} />
        )}
      </div>

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

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

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
