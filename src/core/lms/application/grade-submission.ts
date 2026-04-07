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
  correct: z.array(z.array(z.string())),
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

export interface BlankResult {
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswers: string[];
}

export interface GradingDetailRow {
  questionId: string;
  questionText: string;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswers: string[];
  blankResults?: BlankResult[];
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
    let blankResults: BlankResult[] | undefined;

    if (q.type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
      ok = isMultiSelectCorrect(selected, q.correct);
      studentAnswer = selected.join(", ");
    } else {
      const studentAnswers = Array.isArray(raw) ? raw : raw ? [raw] : [];

      blankResults = q.correct.map((accepted, i) => {
        const ans = studentAnswers[i] ?? "";
        const isBlankCorrect = accepted.some(
          (a) => normalizeAnswer(a) === normalizeAnswer(ans),
        );
        return { isCorrect: isBlankCorrect, studentAnswer: ans, correctAnswers: accepted };
      });

      ok = blankResults.every((r) => r.isCorrect);
      studentAnswer = studentAnswers.join(", ");
    }

    if (ok) correctCount += 1;
    details.push({
      questionId: q.id,
      questionText: q.question.text,
      isCorrect: ok,
      studentAnswer,
      correctAnswers: q.type === "MULTIPLE_CHOICE" ? q.correct : q.correct.flat(),
      blankResults,
      ...(!ok && { explain: q.explain }),
    });
  }

  const score = total === 0 ? 0 : (correctCount / total) * 100;
  return { score, details };
}
