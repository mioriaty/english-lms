"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Textarea } from "@/libs/components/ui/textarea";
import { Badge } from "@/libs/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/libs/components/ui/select";
import type { Question, QuestionType } from "@/core/lms/domain/question.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DraftQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[]; // MULTIPLE_CHOICE only
  correct: string[]; // MULTIPLE_CHOICE only: correct option values
  fillBlanks: string[][]; // FILL_IN_THE_BLANK only: per-blank accepted answers
  explain: string;
}

function newDraft(type: QuestionType = "MULTIPLE_CHOICE"): DraftQuestion {
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

function draftToQuestion(d: DraftQuestion): Question {
  const base = {
    id: d.id,
    question: { text: d.questionText, audio: null },
    explain: d.explain || undefined,
  };
  if (d.type === "MULTIPLE_CHOICE") {
    return {
      ...base,
      type: "MULTIPLE_CHOICE",
      options: d.options.filter(Boolean),
      correct: d.correct,
    };
  }
  return { ...base, type: "FILL_IN_THE_BLANK", correct: d.fillBlanks };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OptionRow({
  value,
  index,
  isCorrect,
  onChangeValue,
  onToggleCorrect,
  onDelete,
}: {
  value: string;
  index: number;
  isCorrect: boolean;
  onChangeValue: (v: string) => void;
  onToggleCorrect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleCorrect}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
          isCorrect
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 text-zinc-400 hover:border-zinc-400 dark:border-zinc-600"
        }`}
        title="Mark as correct answer"
      >
        {String.fromCharCode(65 + index)}
      </button>
      <Input
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={`Option ${String.fromCharCode(65 + index)}`}
        className="flex-1"
      />
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AnswerTag({
  value,
  onDelete,
}: {
  value: string;
  onDelete: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 py-1 pl-2 pr-1"
    >
      {value}
      <button
        type="button"
        onClick={onDelete}
        className="ml-1 rounded hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

function QuestionCard({
  draft,
  index,
  onChange,
  onDelete,
}: {
  draft: DraftQuestion;
  index: number;
  onChange: (d: DraftQuestion) => void;
  onDelete: () => void;
}) {
  const [blankInputs, setBlankInputs] = useState<string[]>(() =>
    Array(draft.fillBlanks.length).fill("")
  );

  // Sync blankInputs length when blank count changes (preserve typed values)
  useEffect(() => {
    setBlankInputs((prev) =>
      Array.from(
        { length: draft.fillBlanks.length },
        (_, i) => prev[i] ?? ""
      )
    );
  }, [draft.fillBlanks.length]);

  const detectedBlankCount = (draft.questionText.match(/\[BLANK\]/g) ?? [])
    .length;

  function setType(type: QuestionType) {
    onChange({ ...draft, type, correct: [], fillBlanks: [] });
  }

  function setQuestionText(text: string) {
    const blankCount = (text.match(/\[BLANK\]/g) ?? []).length;
    const newFillBlanks = Array.from(
      { length: blankCount },
      (_, i) => draft.fillBlanks[i] ?? []
    );
    onChange({ ...draft, questionText: text, fillBlanks: newFillBlanks });
  }

  function setOption(i: number, value: string) {
    const options = [...draft.options];
    options[i] = value;
    const correct = draft.correct.filter((c) => options.includes(c));
    onChange({ ...draft, options, correct });
  }

  function addOption() {
    onChange({ ...draft, options: [...draft.options, ""] });
  }

  function deleteOption(i: number) {
    const removed = draft.options[i];
    const options = draft.options.filter((_, idx) => idx !== i);
    const correct = draft.correct.filter((c) => c !== removed);
    onChange({ ...draft, options, correct });
  }

  function toggleOptionCorrect(optionValue: string) {
    const correct = draft.correct.includes(optionValue)
      ? draft.correct.filter((c) => c !== optionValue)
      : [...draft.correct, optionValue];
    onChange({ ...draft, correct });
  }

  function addBlankAnswer(blankIdx: number) {
    const trimmed = (blankInputs[blankIdx] ?? "").trim();
    if (!trimmed || draft.fillBlanks[blankIdx]?.includes(trimmed)) return;
    const newFillBlanks = draft.fillBlanks.map((accepted, i) =>
      i === blankIdx ? [...accepted, trimmed] : accepted
    );
    onChange({ ...draft, fillBlanks: newFillBlanks });
    setBlankInputs((prev) => {
      const next = [...prev];
      next[blankIdx] = "";
      return next;
    });
  }

  function removeBlankAnswer(blankIdx: number, val: string) {
    const newFillBlanks = draft.fillBlanks.map((accepted, i) =>
      i === blankIdx ? accepted.filter((a) => a !== val) : accepted
    );
    onChange({ ...draft, fillBlanks: newFillBlanks });
  }

  return (
    <div className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-500">
            Question {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={draft.type}
            onValueChange={(v) => setType(v as QuestionType)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">
                Fill in the Blank
              </SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-zinc-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question text */}
      <div className="mb-4 space-y-1.5">
        <Label className="text-xs text-zinc-500">Question text</Label>
        <Textarea
          value={draft.questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={
            draft.type === "FILL_IN_THE_BLANK"
              ? "VD: Tiến huy ăn [BLANK] ngoài cút ra TH còn ăn [BLANK]"
              : "VD: What is the capital of France?"
          }
          rows={2}
          required
        />
        {draft.type === "FILL_IN_THE_BLANK" && (
          <p className="text-xs text-zinc-400">
            Dùng{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
              [BLANK]
            </code>{" "}
            để đánh dấu chỗ trống.
            {detectedBlankCount > 0 && (
              <span className="ml-1 font-medium text-zinc-500">
                {detectedBlankCount} blank
                {detectedBlankCount > 1 ? "s" : ""} detected.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Options — MULTIPLE_CHOICE only */}
      {draft.type === "MULTIPLE_CHOICE" && (
        <div className="mb-4 space-y-1.5">
          <Label className="text-xs text-zinc-500">
            Options{" "}
            <span className="text-zinc-400">
              (click the letter to mark correct)
            </span>
          </Label>
          <div className="space-y-2">
            {draft.options.map((opt, i) => (
              <OptionRow
                key={i}
                value={opt}
                index={i}
                isCorrect={draft.correct.includes(opt) && opt !== ""}
                onChangeValue={(v) => setOption(i, v)}
                onToggleCorrect={() => opt && toggleOptionCorrect(opt)}
                onDelete={() => deleteOption(i)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-7 text-xs"
            onClick={addOption}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add option
          </Button>
        </div>
      )}

      {/* Per-blank answers — FILL_IN_THE_BLANK */}
      {draft.type === "FILL_IN_THE_BLANK" && (
        <div className="mb-4 space-y-4">
          {draft.fillBlanks.length === 0 ? (
            <p className="text-xs italic text-zinc-400">
              Thêm{" "}
              <code className="font-mono">[BLANK]</code> vào câu hỏi để cấu
              hình đáp án cho từng blank.
            </p>
          ) : (
            draft.fillBlanks.map((accepted, blankIdx) => (
              <div key={blankIdx} className="space-y-1.5">
                <Label className="text-xs text-zinc-500">
                  Blank {blankIdx + 1} — accepted answers
                  <span className="ml-1 text-zinc-400">(nhiều variant OK)</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {accepted.map((val) => (
                    <AnswerTag
                      key={val}
                      value={val}
                      onDelete={() => removeBlankAnswer(blankIdx, val)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={blankInputs[blankIdx] ?? ""}
                    onChange={(e) => {
                      const next = [...blankInputs];
                      next[blankIdx] = e.target.value;
                      setBlankInputs(next);
                    }}
                    placeholder="VD: cút"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBlankAnswer(blankIdx);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() => addBlankAnswer(blankIdx)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Explain */}
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500">Explanation (optional)</Label>
        <Input
          value={draft.explain}
          onChange={(e) => onChange({ ...draft, explain: e.target.value })}
          placeholder="VD: Paris is the capital of France."
          className="text-sm"
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface QuestionBuilderProps {
  onSubmit: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

export function QuestionBuilder({
  onSubmit,
  initialQuestions,
}: QuestionBuilderProps) {
  const [drafts, setDrafts] = useState<DraftQuestion[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.question.text,
        options: q.type === "MULTIPLE_CHOICE" ? q.options : [],
        correct: q.type === "MULTIPLE_CHOICE" ? q.correct : [],
        fillBlanks: q.type === "FILL_IN_THE_BLANK" ? q.correct : [],
        explain: q.explain ?? "",
      }));
    }
    return [newDraft()];
  });

  function updateDraft(index: number, d: DraftQuestion) {
    setDrafts((prev) => prev.map((item, i) => (i === index ? d : item)));
  }

  function deleteDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function addQuestion(type: QuestionType) {
    setDrafts((prev) => [...prev, newDraft(type)]);
  }

  function handleSubmit() {
    const questions = drafts.map(draftToQuestion);
    onSubmit(questions);
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft, i) => (
        <QuestionCard
          key={draft.id}
          draft={draft}
          index={i}
          onChange={(d) => updateDraft(i, d)}
          onDelete={() => deleteDraft(i)}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("MULTIPLE_CHOICE")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Multiple Choice
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("FILL_IN_THE_BLANK")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Fill in the Blank
        </Button>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto"
        >
          Save Questions
        </Button>
      </div>
    </div>
  );
}
