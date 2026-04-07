import { useState } from "react";
import { submitAssignment } from "@/app/actions/submission-actions";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";

interface SubmissionResult {
  score: number;
  details: GradingDetailRow[];
}

export function useAssignmentForm(assignmentId: string) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleOption(questionId: string, option: string) {
    setAnswers((prev) => {
      const current = prev[questionId];
      const selected = Array.isArray(current) ? current : current ? [current] : [];
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSubmit(answers);
  }

  return { answers, setAnswers, result, error, pending, submitted, toggleOption, doSubmit, onSubmit };
}
