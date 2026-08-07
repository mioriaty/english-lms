import { describe, it, expect } from "vitest";
import {
  normalizeAnswer,
  gradeSubmission,
  parseAssignmentQuestions,
} from "../grade-submission";
import type { Question } from "../../domain/question.types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function mcQuestion(
  id: string,
  correct: string[],
  options?: string[]
): Question {
  return {
    id,
    type: "MULTIPLE_CHOICE",
    question: { text: `Question ${id}`, audio: null },
    options: options ?? correct,
    correct,
  };
}

function fibQuestion(id: string, correct: string[][]): Question {
  return {
    id,
    type: "FILL_IN_THE_BLANK",
    question: { text: `Question ${id}`, audio: null },
    correct,
  };
}

function groupQuestion(
  id: string,
  subQuestions: (Question & { type: "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK" })[]
): Question {
  return {
    id,
    type: "GROUP",
    question: { text: `Group ${id}`, audio: null },
    subQuestions,
  };
}

// ─── normalizeAnswer ──────────────────────────────────────────────────────────

describe("normalizeAnswer", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeAnswer("  hello  ")).toBe("hello");
  });

  it("converts to lowercase", () => {
    expect(normalizeAnswer("Hello World")).toBe("hello world");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalizeAnswer("hello   world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(normalizeAnswer("")).toBe("");
  });

  it("handles string with only spaces", () => {
    expect(normalizeAnswer("   ")).toBe("");
  });
});

// ─── gradeSubmission — Multiple Choice ───────────────────────────────────────

describe("gradeSubmission — MULTIPLE_CHOICE", () => {
  it("scores 100 when single-select answer is correct", () => {
    const questions = [mcQuestion("q1", ["A"])];
    const { score, details } = gradeSubmission(questions, { q1: "A" });

    expect(score).toBe(100);
    expect(details[0].isCorrect).toBe(true);
  });

  it("scores 0 when single-select answer is wrong", () => {
    const questions = [mcQuestion("q1", ["A"])];
    const { score } = gradeSubmission(questions, { q1: "B" });

    expect(score).toBe(0);
  });

  it("is case-insensitive for MC answers", () => {
    const questions = [mcQuestion("q1", ["paris"])];
    const { score } = gradeSubmission(questions, { q1: "Paris" });

    expect(score).toBe(100);
  });

  it("scores 100 for correct multi-select regardless of order", () => {
    const questions = [mcQuestion("q1", ["A", "B", "C"])];
    const { score } = gradeSubmission(questions, { q1: ["C", "A", "B"] });

    expect(score).toBe(100);
  });

  it("scores 0 when multi-select has extra selection", () => {
    const questions = [mcQuestion("q1", ["A", "B"])];
    const { score } = gradeSubmission(questions, { q1: ["A", "B", "C"] });

    expect(score).toBe(0);
  });

  it("scores 0 when multi-select is missing a selection", () => {
    const questions = [mcQuestion("q1", ["A", "B"])];
    const { score } = gradeSubmission(questions, { q1: ["A"] });

    expect(score).toBe(0);
  });

  it("scores 0 when answer is missing", () => {
    const questions = [mcQuestion("q1", ["A"])];
    const { score } = gradeSubmission(questions, {});

    expect(score).toBe(0);
  });

  it("averages score across multiple questions", () => {
    const questions = [mcQuestion("q1", ["A"]), mcQuestion("q2", ["B"])];
    const { score } = gradeSubmission(questions, { q1: "A", q2: "X" });

    expect(score).toBe(50);
  });
});

// ─── gradeSubmission — Fill in the Blank ─────────────────────────────────────

describe("gradeSubmission — FILL_IN_THE_BLANK", () => {
  it("scores 100 when single blank is correct", () => {
    const questions = [fibQuestion("q1", [["cat"]])];
    const { score, details } = gradeSubmission(questions, { q1: ["cat"] });

    expect(score).toBe(100);
    expect(details[0].isCorrect).toBe(true);
    expect(details[0].correctBlanks).toBe(1);
    expect(details[0].totalBlanks).toBe(1);
  });

  it("accepts any variant in the accepted-answers list", () => {
    const questions = [fibQuestion("q1", [["cat", "kitten"]])];
    const { score } = gradeSubmission(questions, { q1: ["kitten"] });

    expect(score).toBe(100);
  });

  it("is case-insensitive for blank answers", () => {
    const questions = [fibQuestion("q1", [["cat"]])];
    const { score } = gradeSubmission(questions, { q1: ["Cat"] });

    expect(score).toBe(100);
  });

  it("scores each blank independently — partial credit", () => {
    const questions = [fibQuestion("q1", [["cat"], ["dog"]])];
    // Only blank 1 correct → 1/2 blanks = 50
    const { score, details } = gradeSubmission(questions, {
      q1: ["cat", "wrong"],
    });

    expect(score).toBe(50);
    expect(details[0].correctBlanks).toBe(1);
    expect(details[0].totalBlanks).toBe(2);
    expect(details[0].isCorrect).toBe(false); // not fully correct
  });

  it("scores 100 when all blanks in multi-blank question are correct", () => {
    const questions = [fibQuestion("q1", [["cat"], ["dog"]])];
    const { score, details } = gradeSubmission(questions, {
      q1: ["cat", "dog"],
    });

    expect(score).toBe(100);
    expect(details[0].isCorrect).toBe(true);
  });

  it("scores 0 when answer is missing entirely", () => {
    const questions = [fibQuestion("q1", [["cat"]])];
    const { score } = gradeSubmission(questions, {});

    expect(score).toBe(0);
  });

  it("populates blankResults per blank", () => {
    const questions = [fibQuestion("q1", [["cat"], ["dog"]])];
    const { details } = gradeSubmission(questions, { q1: ["cat", "fish"] });
    const blankResults = details[0].blankResults!;

    expect(blankResults).toHaveLength(2);
    expect(blankResults[0].isCorrect).toBe(true);
    expect(blankResults[1].isCorrect).toBe(false);
    expect(blankResults[1].studentAnswer).toBe("fish");
    expect(blankResults[1].correctAnswers).toEqual(["dog"]);
  });
});

// ─── gradeSubmission — GROUP questions ───────────────────────────────────────

describe("gradeSubmission — GROUP", () => {
  it("flattens sub-questions and scores them independently", () => {
    const sub1 = mcQuestion("s1", ["A"]) as Question & {
      type: "MULTIPLE_CHOICE";
    };
    const sub2 = mcQuestion("s2", ["B"]) as Question & {
      type: "MULTIPLE_CHOICE";
    };
    const questions = [groupQuestion("g1", [sub1, sub2])];
    const { score, details } = gradeSubmission(questions, {
      s1: "A",
      s2: "X",
    });

    expect(score).toBe(50);
    expect(details).toHaveLength(2);
    expect(details[0].questionId).toBe("s1");
    expect(details[0].isCorrect).toBe(true);
    expect(details[1].questionId).toBe("s2");
    expect(details[1].isCorrect).toBe(false);
  });

  it("supports FIB sub-questions with partial credit inside a group", () => {
    const sub = fibQuestion("s1", [["cat"], ["dog"]]) as Question & {
      type: "FILL_IN_THE_BLANK";
    };
    const questions = [groupQuestion("g1", [sub])];
    const { score } = gradeSubmission(questions, { s1: ["cat", "wrong"] });

    expect(score).toBe(50);
  });
});

// ─── gradeSubmission — Edge cases ────────────────────────────────────────────

describe("gradeSubmission — edge cases", () => {
  it("returns score 0 when there are no questions", () => {
    const { score } = gradeSubmission([], {});
    expect(score).toBe(0);
  });

  it("attaches explain only when question is wrong and has explain", () => {
    const q: Question = {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      question: { text: "What?", audio: null },
      options: ["A", "B"],
      correct: ["A"],
      explain: "Because A is correct",
    };
    const { details } = gradeSubmission([q], { q1: "B" });

    expect(details[0].explain).toBe("Because A is correct");
  });

  it("does NOT attach explain when question is correct", () => {
    const q: Question = {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      question: { text: "What?", audio: null },
      options: ["A", "B"],
      correct: ["A"],
      explain: "Because A is correct",
    };
    const { details } = gradeSubmission([q], { q1: "A" });

    expect(details[0].explain).toBeUndefined();
  });
});

// ─── parseAssignmentQuestions ─────────────────────────────────────────────────

describe("parseAssignmentQuestions", () => {
  it("parses a valid MC question array", () => {
    const raw = [
      {
        id: "q1",
        type: "MULTIPLE_CHOICE",
        question: { text: "What?", audio: null },
        options: ["A", "B"],
        correct: ["A"],
      },
    ];
    const result = parseAssignmentQuestions(raw);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("MULTIPLE_CHOICE");
  });

  it("parses a valid FIB question", () => {
    const raw = [
      {
        id: "q1",
        type: "FILL_IN_THE_BLANK",
        question: { text: "Fill __", audio: null },
        correct: [["cat", "kitten"]],
      },
    ];
    const result = parseAssignmentQuestions(raw);
    expect(result[0].type).toBe("FILL_IN_THE_BLANK");
  });

  it("throws ZodError for invalid data structure", () => {
    expect(() => parseAssignmentQuestions([{ id: "q1", type: "UNKNOWN" }])).toThrow();
  });

  it("throws ZodError when required field is missing", () => {
    expect(() =>
      parseAssignmentQuestions([{ type: "MULTIPLE_CHOICE" }])
    ).toThrow();
  });
});
