"use client";

import { useState } from "react";
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
  correct: string[];
  explain: string;
}

function newDraft(type: QuestionType = "MULTIPLE_CHOICE"): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    questionText: "",
    options: ["", "", "", ""],
    correct: [],
    explain: "",
  };
}

function draftToQuestion(d: DraftQuestion): Question {
  const base = {
    id: d.id,
    question: { text: d.questionText, audio: null },
    correct: d.correct,
    explain: d.explain,
  };
  if (d.type === "MULTIPLE_CHOICE") {
    return {
      ...base,
      type: "MULTIPLE_CHOICE",
      options: d.options.filter(Boolean),
    };
  }
  return { ...base, type: "FILL_IN_THE_BLANK" };
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
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
          isCorrect
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 text-zinc-400 hover:border-zinc-400 dark:border-zinc-600"
        }`}
        title="Đánh dấu đáp án đúng"
      >
        {String.fromCharCode(65 + index)}
      </button>
      <Input
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
        className="flex-1"
      />
      <button
        type="button"
        onClick={onDelete}
        className="flex-shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CorrectAnswerTag({
  value,
  onDelete,
}: {
  value: string;
  onDelete: () => void;
}) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
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
  const [correctInput, setCorrectInput] = useState("");

  function setType(type: QuestionType) {
    onChange({ ...draft, type, correct: [] });
  }

  function setQuestionText(text: string) {
    onChange({ ...draft, questionText: text });
  }

  function setOption(i: number, value: string) {
    const options = [...draft.options];
    options[i] = value;
    // Remove from correct if option text changed
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

  function addCorrectAnswer() {
    const trimmed = correctInput.trim();
    if (!trimmed || draft.correct.includes(trimmed)) return;
    onChange({ ...draft, correct: [...draft.correct, trimmed] });
    setCorrectInput("");
  }

  function removeCorrectAnswer(val: string) {
    onChange({ ...draft, correct: draft.correct.filter((c) => c !== val) });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-500">
            Câu {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={draft.type} onValueChange={(v) => setType(v as QuestionType)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">Điền từ vào chỗ trống</SelectItem>
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
        <Label className="text-xs text-zinc-500">Câu hỏi</Label>
        <Textarea
          value={draft.questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={
            draft.type === "FILL_IN_THE_BLANK"
              ? 'VD: I ___ (be) a teacher.'
              : 'VD: What is the capital of France?'
          }
          rows={2}
          required
        />
      </div>

      {/* Options — MULTIPLE_CHOICE only */}
      {draft.type === "MULTIPLE_CHOICE" && (
        <div className="mb-4 space-y-1.5">
          <Label className="text-xs text-zinc-500">
            Các đáp án{" "}
            <span className="text-zinc-400">(click chữ cái để đánh dấu đúng)</span>
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
            Thêm đáp án
          </Button>
        </div>
      )}

      {/* Correct answers — FILL_IN_THE_BLANK */}
      {draft.type === "FILL_IN_THE_BLANK" && (
        <div className="mb-4 space-y-1.5">
          <Label className="text-xs text-zinc-500">
            Đáp án đúng{" "}
            <span className="text-zinc-400">(nhiều đáp án được chấp nhận)</span>
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {draft.correct.map((val) => (
              <CorrectAnswerTag
                key={val}
                value={val}
                onDelete={() => removeCorrectAnswer(val)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={correctInput}
              onChange={(e) => setCorrectInput(e.target.value)}
              placeholder='VD: am'
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCorrectAnswer();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={addCorrectAnswer}
            >
              Thêm
            </Button>
          </div>
        </div>
      )}

      {/* Explain */}
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500">Giải thích (tuỳ chọn)</Label>
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
  /** Gọi khi submit — trả về mảng Question đã validated */
  onSubmit: (questions: Question[]) => void;
  /** Dữ liệu ban đầu nếu edit */
  initialQuestions?: Question[];
}

export function QuestionBuilder({ onSubmit, initialQuestions }: QuestionBuilderProps) {
  const [drafts, setDrafts] = useState<DraftQuestion[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.question.text,
        options: q.type === "MULTIPLE_CHOICE" ? q.options : [],
        correct: q.correct,
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

      {/* Add question buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("MULTIPLE_CHOICE")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm trắc nghiệm
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion("FILL_IN_THE_BLANK")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm điền từ
        </Button>
      </div>

      <div className="pt-2">
        <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
          Lưu câu hỏi
        </Button>
      </div>
    </div>
  );
}
