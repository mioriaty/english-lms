"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { submitAssignment } from "@/app/actions/submission-actions";
import type { Question } from "@/core/lms/domain/question.types";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";
import { Button } from "@/libs/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/libs/utils/string";

interface AssignmentTakeFormProps {
  assignmentId: string;
  title: string;
  questions: Question[];
  timeLimitSeconds: number | null;
}

function useCountdown(totalSeconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState<number | null>(totalSeconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (totalSeconds === null) return;
    setRemaining(totalSeconds);
    expiredRef.current = false;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          // Schedule onExpire OUTSIDE the updater to avoid setState-in-render
          if (!expiredRef.current) {
            expiredRef.current = true;
            setTimeout(() => {
              startTransition(() => onExpireRef.current());
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  return remaining;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function CountdownBadge({ seconds }: { seconds: number }) {
  const isWarning = seconds <= 60;
  const isCritical = seconds <= 10;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-semibold tabular-nums transition-colors ${
        isCritical
          ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : isWarning
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      <span className="text-xs">⏱</span>
      {formatTime(seconds)}
    </div>
  );
}

/** A → A, B → B, ... (0-indexed) */
function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

/**
 * reviewMode:
 *   "correct"  — đáp án đúng (đã chọn đúng)       → xanh
 *   "missed"   — đáp án đúng nhưng chưa chọn       → xanh viền đứt
 *   "wrong"    — chọn sai                          → xám đậm gạch
 *   "normal"   — không liên quan sau submit / chưa submit
 */
type ReviewMode = "correct" | "missed" | "wrong" | "normal";

/** Multiple choice option row */
function OptionRow({
  label,
  text,
  selected,
  disabled,
  onClick,
  reviewMode = "normal",
}: {
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  reviewMode?: ReviewMode;
}) {
  const isReview = reviewMode !== "normal";

  const rowClass = cn(
    "flex w-full items-center overflow-hidden rounded border text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    !isReview && selected && "border-[#2F5B94] bg-[#EDF2F9] text-[#2F5B94]",
    !isReview &&
      !selected &&
      "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
    reviewMode === "correct" && "border-[#2F5B94] bg-[#EDF2F9] text-[#2F5B94]",
    reviewMode === "missed" &&
      "border-dashed border-[#2F5B94] bg-white text-[#2F5B94] opacity-70",
    reviewMode === "wrong" &&
      "border-zinc-300 bg-zinc-100 text-zinc-500 line-through",
    reviewMode === "normal" && !selected && !disabled && "",
    disabled && "cursor-default",
  );

  const badgeClass = cn(
    "flex h-full min-w-13 items-center justify-center border-r px-3 py-3.5 font-semibold",
    !isReview && selected && "border-[#2F5B94] text-[#2F5B94]",
    !isReview &&
      !selected &&
      "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
    reviewMode === "correct" && "border-[#2F5B94] text-[#2F5B94]",
    reviewMode === "missed" && "border-[#2F5B94] text-[#2F5B94]",
    reviewMode === "wrong" && "border-zinc-300 text-zinc-400",
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={rowClass}
    >
      {/* Letter badge */}
      <span className={badgeClass}>{label}</span>
      {/* Option text */}
      <span className="flex-1 px-4 py-3.5">{text}</span>
      {/* Icons */}
      {!isReview && selected && (
        <CheckCircle2
          className="mr-3 h-5 w-5 shrink-0 text-[#2F5B94]"
          aria-hidden="true"
        />
      )}
      {reviewMode === "correct" && (
        <CheckCircle2
          className="mr-3 h-5 w-5 shrink-0 text-[#2F5B94]"
          aria-hidden="true"
        />
      )}
      {reviewMode === "missed" && (
        <CheckCircle2
          className="mr-3 h-5 w-5 shrink-0 text-[#2F5B94] opacity-60"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/** Fill-in-the-blank inline input */
function FillBlankInline({
  template,
  value,
  onChange,
  disabled,
  questionId,
}: {
  template: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  questionId: string;
}) {
  // Split on [BLANK] placeholder. If no placeholder, show single input below.
  const parts = template.split(/(\[BLANK\])/);
  const hasPlaceholder = parts.some((p) => p === "[BLANK]");

  if (!hasPlaceholder) {
    // Fallback: sentence in italic above, input below
    return (
      <div className="space-y-3">
        <p className="font-serif italic leading-relaxed text-zinc-700 dark:text-zinc-300">
          {template}
        </p>
        <input
          id={questionId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Type your answer…"
          className="border-b border-zinc-400 bg-transparent px-1 pb-0.5 text-sm focus:border-[#2F5B94] focus:outline-none dark:border-zinc-500 dark:text-zinc-100"
        />
      </div>
    );
  }

  return (
    <p className="font-serif italic leading-relaxed text-zinc-700 dark:text-zinc-300">
      {parts.map((part, i) =>
        part === "[BLANK]" ? (
          <input
            key={i}
            id={questionId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            aria-label="Fill in the blank"
            className="mx-1 inline-block min-w-[140px] border-b border-zinc-400 bg-transparent px-1 pb-0.5 text-center not-italic focus:border-[#2F5B94] focus:outline-none dark:border-zinc-500 dark:text-zinc-100"
          />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

export function AssignmentTakeForm({
  assignmentId,
  title,
  questions,
  timeLimitSeconds,
}: AssignmentTakeFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<{
    score: number;
    details: GradingDetailRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function toggleOption(questionId: string, option: string) {
    setAnswers((prev) => {
      const current = prev[questionId];
      const selected = Array.isArray(current)
        ? current
        : current
          ? [current]
          : [];
      const next = selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option];
      return { ...prev, [questionId]: next };
    });
  }

  async function doSubmit(currentAnswers: Record<string, string | string[]>) {
    if (submitted) return;
    setSubmitted(true);
    setError(null);
    setPending(true);
    try {
      const res = await submitAssignment(assignmentId, currentAnswers);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
      setSubmitted(false);
    } finally {
      setPending(false);
    }
  }

  const remaining = useCountdown(submitted ? null : timeLimitSeconds, () => {
    doSubmit(answers);
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSubmit(answers);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
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

      <form ref={formRef} className="space-y-6" onSubmit={onSubmit}>
        {questions.map((q, idx) => (
          <Card key={q.id} className="overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Question text */}
              <p className="text-2xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                {q.question.text}
              </p>

              {/* Options */}
              {q.type === "MULTIPLE_CHOICE" ? (
                <fieldset className="space-y-2" disabled={submitted}>
                  <legend className="sr-only">
                    Choose all correct answers
                  </legend>
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[q.id];
                    const isChecked = Array.isArray(selected)
                      ? selected.includes(opt)
                      : selected === opt;

                    // Tính review mode sau khi submit
                    let reviewMode: ReviewMode = "normal";
                    if (submitted && result) {
                      const detail = result.details.find(
                        (d) => d.questionId === q.id,
                      );
                      const correctAnswers = detail?.correctAnswers ?? [];
                      const isCorrectOpt = correctAnswers.includes(opt);
                      if (isCorrectOpt && isChecked) reviewMode = "correct";
                      else if (isCorrectOpt && !isChecked)
                        reviewMode = "missed";
                      else if (!isCorrectOpt && isChecked) reviewMode = "wrong";
                      else reviewMode = "normal";
                    }

                    return (
                      <OptionRow
                        key={opt}
                        label={optionLabel(optIdx)}
                        text={opt}
                        selected={isChecked}
                        disabled={submitted}
                        onClick={() => toggleOption(q.id, opt)}
                        reviewMode={reviewMode}
                      />
                    );
                  })}
                </fieldset>
              ) : (() => {
                  const fillDetail = submitted && result
                    ? result.details.find((d) => d.questionId === q.id)
                    : null;
                  const isCorrect = fillDetail?.isCorrect ?? false;
                  const correctAnswers = fillDetail?.correctAnswers ?? [];

                  return (
                    <div className="space-y-3">
                      <div className={`rounded border p-4 ${
                        submitted
                          ? isCorrect
                            ? "border-[#2F5B94] bg-[#EDF2F9]"
                            : "border-zinc-300 bg-zinc-100"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
                      }`}>
                        <FillBlankInline
                          template={q.question.text}
                          value={(answers[q.id] as string) ?? ""}
                          onChange={(v) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: v }))
                          }
                          disabled={submitted}
                          questionId={q.id}
                        />
                      </div>

                      {/* Đáp án đúng sau khi submit */}
                      {submitted && fillDetail && (
                        <p className="text-sm">
                          <span className="text-zinc-500">Correct answer: </span>
                          <span className="font-semibold" style={{ color: "#2F5B94" }}>
                            {correctAnswers.join(" / ")}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })()}

            </CardContent>
          </Card>
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

      {/* Results */}
      {result && (
        <Card
          style={{
            borderColor: "#2F5B9440",
            backgroundColor: "#EDF2F940",
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <p className="text-2xl font-bold" style={{ color: "#2F5B94" }}>
              {result.score.toFixed(1)} pts
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.details.every((d) => d.isCorrect) ? (
              <p className="font-medium" style={{ color: "#2F5B94" }}>
                🎉 Congratulations — all correct!
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Incorrect answers — see explanation
                </p>
                <ul className="space-y-3 text-sm">
                  {result.details
                    .filter((d) => !d.isCorrect)
                    .map((d) => (
                      <li
                        key={d.questionId}
                        className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <p className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {d.questionText}
                        </p>
                        <p className="mt-1">
                          Your answer:{" "}
                          <span className="font-medium">
                            &quot;{d.studentAnswer || "—"}&quot;
                          </span>
                        </p>
                        {d.explain && (
                          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            {d.explain}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
