import type { LeafQuestion, Question, QuestionType } from "@/core/lms/domain/question.types";

export interface DraftLeafQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  description: string;
  audioUrl: string | null;
  imageUrl: string | null;
  options: string[];
  correct: string[];
  fillBlanks: string[][];
  explain: string;
}

export interface DraftGroupQuestion {
  id: string;
  type: "GROUP";
  questionText: string;
  description: string;
  audioUrl: string | null;
  imageUrl: string | null;
  subQuestions: DraftLeafQuestion[];
}

export type DraftQuestion = DraftLeafQuestion | DraftGroupQuestion;

export function newLeafDraft(type: QuestionType = "MULTIPLE_CHOICE"): DraftLeafQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    questionText: "",
    description: "",
    audioUrl: null,
    imageUrl: null,
    options: ["", "", "", ""],
    correct: [],
    fillBlanks: [],
    explain: "",
  };
}

export function newGroupDraft(): DraftGroupQuestion {
  return {
    id: crypto.randomUUID(),
    type: "GROUP",
    questionText: "",
    description: "",
    audioUrl: null,
    imageUrl: null,
    subQuestions: [newLeafDraft()],
  };
}

/** Kept for backward compat — creates a leaf draft */
export function newDraft(type: QuestionType = "MULTIPLE_CHOICE"): DraftLeafQuestion {
  return newLeafDraft(type);
}

export function leafDraftToQuestion(d: DraftLeafQuestion): LeafQuestion {
  const base = {
    id: d.id,
    question: {
      text: d.questionText,
      audio: d.audioUrl,
      image: d.imageUrl ?? undefined,
      description: d.description || undefined,
    },
    explain: d.explain || undefined,
  };
  if (d.type === "MULTIPLE_CHOICE") {
    return { ...base, type: "MULTIPLE_CHOICE", options: d.options.filter(Boolean), correct: d.correct };
  }
  return { ...base, type: "FILL_IN_THE_BLANK", correct: d.fillBlanks };
}

export function draftToQuestion(d: DraftQuestion): Question {
  if (d.type === "GROUP") {
    return {
      id: d.id,
      type: "GROUP",
      question: {
        text: d.questionText,
        audio: d.audioUrl,
        image: d.imageUrl ?? undefined,
        description: d.description || undefined,
      },
      subQuestions: d.subQuestions.map(leafDraftToQuestion),
    };
  }
  return leafDraftToQuestion(d);
}
