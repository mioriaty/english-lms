import { describe, it, expect } from "vitest";
import { validateQuestions } from "../question-validation";
import type { Question } from "../question.types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function validMC(id = "q1"): Question {
  return {
    id,
    type: "MULTIPLE_CHOICE",
    question: { text: "What is 2+2?", audio: null },
    options: ["3", "4", "5"],
    correct: ["4"],
  };
}

function validFIB(id = "q1"): Question {
  return {
    id,
    type: "FILL_IN_THE_BLANK",
    question: { text: "The cat sat on the ___.", audio: null },
    correct: [["mat"]],
  };
}

function validGroup(id = "g1"): Question {
  return {
    id,
    type: "GROUP",
    question: { text: "Read and answer.", audio: null },
    subQuestions: [
      {
        id: "s1",
        type: "MULTIPLE_CHOICE",
        question: { text: "Sub question 1?", audio: null },
        options: ["A", "B"],
        correct: ["A"],
      },
    ],
  };
}

// ─── Empty array ──────────────────────────────────────────────────────────────

describe("validateQuestions — empty array", () => {
  it("returns error when questions array is empty", () => {
    const result = validateQuestions([]);

    expect(result).not.toBeNull();
    expect(result!.message).toBe("At least 1 question required.");
  });
});

// ─── Valid inputs ─────────────────────────────────────────────────────────────

describe("validateQuestions — valid inputs", () => {
  it("returns null for a single valid MC question", () => {
    expect(validateQuestions([validMC()])).toBeNull();
  });

  it("returns null for a single valid FIB question", () => {
    expect(validateQuestions([validFIB()])).toBeNull();
  });

  it("returns null for a valid GROUP question", () => {
    expect(validateQuestions([validGroup()])).toBeNull();
  });

  it("returns null for a mix of valid question types", () => {
    expect(
      validateQuestions([validMC("q1"), validFIB("q2"), validGroup("g1")])
    ).toBeNull();
  });
});

// ─── GROUP question errors ────────────────────────────────────────────────────

describe("validateQuestions — GROUP errors", () => {
  it("returns error when GROUP has no sub-questions", () => {
    const q: Question = {
      id: "g1",
      type: "GROUP",
      question: { text: "Read.", audio: null },
      subQuestions: [],
    };
    const result = validateQuestions([q]);

    expect(result).not.toBeNull();
    expect(result!.message).toBe("Group 1 has no sub-questions.");
  });

  it("returns error when GROUP sub-question has no text", () => {
    const q: Question = {
      id: "g1",
      type: "GROUP",
      question: { text: "Read.", audio: null },
      subQuestions: [
        {
          id: "s1",
          type: "MULTIPLE_CHOICE",
          question: { text: "   ", audio: null }, // whitespace only
          options: ["A"],
          correct: ["A"],
        },
      ],
    };
    const result = validateQuestions([q]);

    expect(result).not.toBeNull();
    expect(result!.message).toBe("Question 1.1 has no question text.");
  });

  it("returns error when GROUP sub-question has no correct answer", () => {
    const q: Question = {
      id: "g1",
      type: "GROUP",
      question: { text: "Read.", audio: null },
      subQuestions: [
        {
          id: "s1",
          type: "MULTIPLE_CHOICE",
          question: { text: "Valid text", audio: null },
          options: ["A"],
          correct: [], // empty!
        },
      ],
    };
    const result = validateQuestions([q]);

    expect(result).not.toBeNull();
    expect(result!.message).toBe("Question 1.1 has no correct answer.");
  });

  it("includes correct 1-indexed position in GROUP error messages", () => {
    const group1 = validGroup("g1");
    const group2: Question = {
      id: "g2",
      type: "GROUP",
      question: { text: "Read.", audio: null },
      subQuestions: [
        {
          id: "s1",
          type: "MULTIPLE_CHOICE",
          question: { text: "", audio: null }, // no text
          options: ["A"],
          correct: ["A"],
        },
      ],
    };
    const result = validateQuestions([group1, group2]);

    expect(result!.message).toBe("Question 2.1 has no question text.");
  });
});

// ─── Leaf question errors ─────────────────────────────────────────────────────

describe("validateQuestions — Leaf question errors", () => {
  it("returns error when MC question has no text", () => {
    const q: Question = {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      question: { text: "", audio: null },
      options: ["A"],
      correct: ["A"],
    };
    const result = validateQuestions([q]);

    expect(result).not.toBeNull();
    expect(result!.message).toBe("Question 1 has no question text.");
  });

  it("returns error when MC question text is only whitespace", () => {
    const q: Question = {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      question: { text: "   ", audio: null },
      options: ["A"],
      correct: ["A"],
    };
    const result = validateQuestions([q]);

    expect(result!.message).toBe("Question 1 has no question text.");
  });

  it("returns error when MC question has no correct answer", () => {
    const q: Question = {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      question: { text: "Valid text", audio: null },
      options: ["A", "B"],
      correct: [],
    };
    const result = validateQuestions([q]);

    expect(result!.message).toBe("Question 1 has no correct answer.");
  });

  it("returns error when FIB question has no text", () => {
    const q: Question = {
      id: "q1",
      type: "FILL_IN_THE_BLANK",
      question: { text: "", audio: null },
      correct: [["cat"]],
    };
    const result = validateQuestions([q]);

    expect(result!.message).toBe("Question 1 has no question text.");
  });

  it("returns error when FIB question has no correct array", () => {
    const q: Question = {
      id: "q1",
      type: "FILL_IN_THE_BLANK",
      question: { text: "Fill __", audio: null },
      correct: [], // no blanks defined
    };
    const result = validateQuestions([q]);

    expect(result!.message).toBe("Question 1 has no correct answer.");
  });

  it("reports the correct 1-indexed position for the second invalid question", () => {
    const q1 = validMC("q1");
    const q2: Question = {
      id: "q2",
      type: "MULTIPLE_CHOICE",
      question: { text: "", audio: null },
      options: ["A"],
      correct: ["A"],
    };
    const result = validateQuestions([q1, q2]);

    expect(result!.message).toBe("Question 2 has no question text.");
  });
});
