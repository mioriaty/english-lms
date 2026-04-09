import type { Question } from "./question.types";

export interface QuestionValidationError {
  message: string;
}

export function validateQuestions(
  questions: Question[]
): QuestionValidationError | null {
  if (questions.length === 0) {
    return { message: "At least 1 question required." };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (q.type === "GROUP") {
      if (q.subQuestions.length === 0) {
        return { message: `Group ${i + 1} has no sub-questions.` };
      }
      for (let j = 0; j < q.subQuestions.length; j++) {
        const sub = q.subQuestions[j];
        if (!sub.question.text.trim()) {
          return { message: `Question ${i + 1}.${j + 1} has no question text.` };
        }
        if (sub.correct.length === 0) {
          return { message: `Question ${i + 1}.${j + 1} has no correct answer.` };
        }
      }
    } else {
      if (!q.question.text.trim()) {
        return { message: `Question ${i + 1} has no question text.` };
      }
      if (q.correct.length === 0) {
        return { message: `Question ${i + 1} has no correct answer.` };
      }
    }
  }

  return null;
}
