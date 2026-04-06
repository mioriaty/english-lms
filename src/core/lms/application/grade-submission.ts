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
  explain: z.string(),
});

const fillBlankSchema = z.object({
  id: z.string(),
  type: z.literal("FILL_IN_THE_BLANK"),
  question: questionTextSchema,
  correct: z.array(z.string()),
  explain: z.string(),
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

function isAnswerCorrect(student: string, accepted: string[]): boolean {
  const n = normalizeAnswer(student);
  return accepted.some((a) => normalizeAnswer(a) === n);
}

export interface GradingDetailRow {
  questionId: string;
  isCorrect: boolean;
  studentAnswer: string;
  explain?: string;
}

export function gradeSubmission(
  questions: Question[],
  answers: Record<string, string>
): { score: number; details: GradingDetailRow[] } {
  const total = questions.length;
  let correctCount = 0;
  const details: GradingDetailRow[] = [];

  for (const q of questions) {
    const raw = answers[q.id] ?? "";
    const ok = isAnswerCorrect(raw, q.correct);
    if (ok) correctCount += 1;
    details.push({
      questionId: q.id,
      isCorrect: ok,
      studentAnswer: raw,
      ...(!ok && { explain: q.explain }),
    });
  }

  const score = total === 0 ? 0 : (correctCount / total) * 100;
  return { score, details };
}
