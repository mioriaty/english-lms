export type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK";

export interface QuestionText {
  text: string;
  audio: string | null;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: "MULTIPLE_CHOICE";
  question: QuestionText;
  options: string[];
  correct: string[];
  explain?: string;
}

export interface FillInTheBlankQuestion {
  id: string;
  type: "FILL_IN_THE_BLANK";
  question: QuestionText;
  /** correct[i] = accepted variants for blank i */
  correct: string[][];
  explain?: string;
}

export type Question = MultipleChoiceQuestion | FillInTheBlankQuestion;
