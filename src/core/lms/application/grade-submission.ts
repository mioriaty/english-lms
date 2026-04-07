import { z } from "zod";
import type { Question } from "../domain/question.types";

const questionTextSchema = z.object({
  text: z.string(),
  audio: z.string().nullable(),
});

const multipleChoiceSchema = z.object({
  id: z.string(),
  type: z.literal("MULTIPLE_CHOICE"),
  question: questionTextSchema,
  options: z.array(z.string()),
  correct: z.array(z.string()),
  explain: z.string().optional(),
});

const fillBlankSchema = z.object({
  id: z.string(),
  type: z.literal("FILL_IN_THE_BLANK"),
  question: questionTextSchema,
  correct: z.array(z.string()),
  explain: z.string().optional(),
});

const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  fillBlankSchema,
]);

const questionsArraySchema = z.array(questionSchema);

export function parseAssignmentQuestions(content: unknown): Question[] {
  return questionsArraySchema.parse(content);
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isMultiSelectCorrect(selected: string[], accepted: string[]): boolean {
  if (selected.length !== accepted.length) return false;
  const normalize = (arr: string[]) =>
    arr.map(normalizeAnswer).sort().join("||");
  return normalize(selected) === normalize(accepted);
}

function isFillCorrect(student: string, accepted: string[]): boolean {
  const n = normalizeAnswer(student);
  return accepted.some((a) => normalizeAnswer(a) === n);
}

export interface GradingDetailRow {
  questionId: string;
  questionText: string;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswers: string[];
  explain?: string;
}

export function gradeSubmission(
  questions: Question[],
  answers: Record<string, string | string[]>,
): { score: number; details: GradingDetailRow[] } {
  const total = questions.length;
  let correctCount = 0;
  const details: GradingDetailRow[] = [];

  for (const q of questions) {
    const raw = answers[q.id];
    let ok = false;
    let studentAnswer = "";

    if (q.type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
      ok = isMultiSelectCorrect(selected, q.correct);
      studentAnswer = selected.join(", ");
    } else {
      const str = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
      ok = isFillCorrect(str, q.correct);
      studentAnswer = str;
    }

    if (ok) correctCount += 1;
    details.push({
      questionId: q.id,
      questionText: q.question.text,
      isCorrect: ok,
      studentAnswer,
      correctAnswers: q.correct,
      ...(!ok && { explain: q.explain }),
    });
  }

  const score = total === 0 ? 0 : (correctCount / total) * 100;
  return { score, details };
}
