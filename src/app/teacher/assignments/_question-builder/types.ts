import type { Question, QuestionType } from "@/core/lms/domain/question.types";

export interface DraftQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correct: string[];
  fillBlanks: string[][];
  explain: string;
}

export function newDraft(type: QuestionType = "MULTIPLE_CHOICE"): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    questionText: "",
    options: ["", "", "", ""],
    correct: [],
    fillBlanks: [],
    explain: "",
  };
}

export function draftToQuestion(d: DraftQuestion): Question {
  const base = {
    id: d.id,
    question: { text: d.questionText, audio: null },
    explain: d.explain || undefined,
  };
  if (d.type === "MULTIPLE_CHOICE") {
    return { ...base, type: "MULTIPLE_CHOICE", options: d.options.filter(Boolean), correct: d.correct };
  }
  return { ...base, type: "FILL_IN_THE_BLANK", correct: d.fillBlanks };
}
