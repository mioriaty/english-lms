"use client";

import { useEffect, useRef, useState } from "react";
import { submitAssignment } from "@/app/actions/submission-actions";
import type { Question } from "@/core/lms/domain/question.types";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/libs/components/ui/card";

interface AssignmentTakeFormProps {
  assignmentId: string;
  title: string;
  questions: Question[];
  timeLimitSeconds: number | null;
}

function useCountdown(totalSeconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState<number | null>(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (totalSeconds === null) return;
    setRemaining(totalSeconds);
    expiredRef.current = false;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
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

export function AssignmentTakeForm({
  assignmentId,
  title,
  questions,
  timeLimitSeconds,
}: AssignmentTakeFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; details: GradingDetailRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function doSubmit(currentAnswers: Record<string, string>) {
    if (submitted) return;
    setSubmitted(true);
    setError(null);
    setPending(true);
    try {
      const res = await submitAssignment(assignmentId, currentAnswers);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không nộp được bài.");
      setSubmitted(false);
    } finally {
      setPending(false);
    }
  }

  const remaining = useCountdown(
    submitted ? null : timeLimitSeconds,
    () => {
      // Auto submit khi hết giờ
      doSubmit(answers);
    }
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSubmit(answers);
  }

  return (
    <div className="space-y-8">
      {/* Header với countdown */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {questions.length} câu hỏi
          </p>
        </div>
        {remaining !== null && !submitted && (
          <CountdownBadge seconds={remaining} />
        )}
      </div>

      <form ref={formRef} className="space-y-8" onSubmit={onSubmit}>
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Câu {idx + 1}{" "}
                <span className="font-normal text-zinc-500">
                  ({q.type === "MULTIPLE_CHOICE" ? "Trắc nghiệm" : "Điền từ"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-zinc-800 dark:text-zinc-200">{q.question.text}</p>
              {q.type === "MULTIPLE_CHOICE" ? (
                <fieldset className="space-y-2">
                  <legend className="sr-only">Chọn đáp án</legend>
                  {q.options.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className="size-4"
                        disabled={submitted}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={q.id}>Điền đáp án</Label>
                  <Input
                    id={q.id}
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    autoComplete="off"
                    disabled={submitted}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        {!submitted && (
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Đang chấm…" : "Nộp bài"}
          </Button>
        )}
      </form>

      {result ? (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle className="text-lg">Kết quả</CardTitle>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {result.score.toFixed(1)} điểm
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Câu sai — xem giải thích
            </p>
            <ul className="space-y-3 text-sm">
              {result.details
                .filter((d) => !d.isCorrect)
                .map((d) => (
                  <li
                    key={d.questionId}
                    className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="font-mono text-xs text-zinc-500">{d.questionId}</p>
                    <p className="mt-1">
                      Bạn trả lời:{" "}
                      <span className="font-medium">&quot;{d.studentAnswer || "—"}&quot;</span>
                    </p>
                    {d.explain ? (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{d.explain}</p>
                    ) : null}
                  </li>
                ))}
            </ul>
            {result.details.every((d) => d.isCorrect) ? (
              <p className="text-emerald-700 dark:text-emerald-300">
                Chúc mừng — tất cả đều đúng.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
