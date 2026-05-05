import { z } from "zod";
import type { LeafQuestion, Question } from "../domain/question.types";

const questionTextSchema = z.object({
  text: z.string(),
  audio: z.string().nullable(),
  image: z.string().nullish(),
  description: z.string().optional(),
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

const leafQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  fillBlankSchema,
]);

const groupSchema = z.object({
  id: z.string(),
  type: z.literal("GROUP"),
  question: questionTextSchema,
  subQuestions: z.array(leafQuestionSchema),
});

const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  fillBlankSchema,
  groupSchema,
]);

const questionsArraySchema = z.array(questionSchema);

export function parseAssignmentQuestions(content: unknown): Question[] {
  return questionsArraySchema.parse(content) as Question[];
}

/** Flattens top-level questions + GROUP sub-questions into a single leaf list */
function flattenLeafQuestions(questions: Question[]): LeafQuestion[] {
  const result: LeafQuestion[] = [];
  for (const q of questions) {
    if (q.type === "GROUP") {
      result.push(...q.subQuestions);
    } else {
      result.push(q);
    }
  }
  return result;
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
  /** For FILL_IN_THE_BLANK: number of correct blanks */
  correctBlanks?: number;
  /** For FILL_IN_THE_BLANK: total number of blanks */
  totalBlanks?: number;
  explain?: string;
}

export function gradeSubmission(
  questions: Question[],
  answers: Record<string, string | string[]>,
): { score: number; details: GradingDetailRow[] } {
  const leafQuestions = flattenLeafQuestions(questions);
  const details: GradingDetailRow[] = [];

  // Track scoring units: each blank or each MC question is 1 unit
  let totalUnits = 0;
  let correctUnits = 0;

  for (const q of leafQuestions) {
    const raw = answers[q.id];
    let ok = false;
    let studentAnswer = "";
    let blankResults: BlankResult[] | undefined;
    let correctBlanks: number | undefined;
    let totalBlanks: number | undefined;

    if (q.type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
      ok = isMultiSelectCorrect(selected, q.correct);
      studentAnswer = selected.join(", ");
      // Each MC question counts as 1 unit
      totalUnits += 1;
      if (ok) correctUnits += 1;
    } else {
      const studentAnswers = Array.isArray(raw) ? raw : raw ? [raw] : [];

      blankResults = q.correct.map((accepted, i) => {
        const ans = studentAnswers[i] ?? "";
        const isBlankCorrect = accepted.some(
          (a) => normalizeAnswer(a) === normalizeAnswer(ans),
        );
        return { isCorrect: isBlankCorrect, studentAnswer: ans, correctAnswers: accepted };
      });

      // Each blank is scored independently
      totalBlanks = blankResults.length;
      correctBlanks = blankResults.filter((r) => r.isCorrect).length;
      totalUnits += totalBlanks;
      correctUnits += correctBlanks;

      // Question is "correct" only if all blanks are correct (for display purposes)
      ok = totalBlanks > 0 && correctBlanks === totalBlanks;
      studentAnswer = studentAnswers.join(", ");
    }

    details.push({
      questionId: q.id,
      questionText: q.question.text,
      isCorrect: ok,
      studentAnswer,
      correctAnswers: q.type === "MULTIPLE_CHOICE" ? q.correct : q.correct.flat(),
      blankResults,
      correctBlanks,
      totalBlanks,
      ...(!ok && q.explain ? { explain: q.explain } : {}),
    });
  }

  const score = totalUnits === 0 ? 0 : (correctUnits / totalUnits) * 100;
  return { score, details };
}
