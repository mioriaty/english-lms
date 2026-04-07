"use client";

import { useState } from "react";
import { GripVertical, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Textarea } from "@/libs/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/libs/components/ui/select";
import type { QuestionType } from "@/core/lms/domain/question.types";
import type { DraftQuestion, DraftLeafQuestion, DraftGroupQuestion } from "./types";
import { newLeafDraft } from "./types";
import { McOptionsEditor } from "./mc-options-editor";
import { FillBlankEditor } from "./fill-blank-editor";
import { AudioUploader } from "./audio-uploader";
import { SubQuestionCard } from "./sub-question-card";

interface QuestionCardProps {
  draft: DraftQuestion;
  index: number;
  onChange: (d: DraftQuestion) => void;
  onDelete: () => void;
}

export function QuestionCard({ draft, index, onChange, onDelete }: QuestionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: draft.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  function handleSetType(newType: QuestionType | "GROUP") {
    if (newType === "GROUP") {
      const next: DraftGroupQuestion = {
        id: draft.id,
        type: "GROUP",
        questionText: draft.questionText,
        audioUrl: draft.audioUrl,
        subQuestions: [newLeafDraft()],
      };
      onChange(next);
    } else if (draft.type === "GROUP") {
      const next: DraftLeafQuestion = {
        id: draft.id,
        type: newType,
        questionText: draft.questionText,
        audioUrl: draft.audioUrl,
        options: ["", "", "", ""],
        correct: [],
        fillBlanks: [],
        explain: "",
      };
      onChange(next);
    } else {
      onChange({ ...draft, type: newType, correct: [], fillBlanks: [] });
    }
  }

  const typeLabel =
    draft.type === "GROUP"
      ? "Group"
      : draft.type === "MULTIPLE_CHOICE"
        ? "Multiple Choice"
        : "Fill in the Blank";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full min-w-0 border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-0.5 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing dark:hover:text-zinc-300"
            suppressHydrationWarning
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className="shrink-0 text-xl font-semibold text-zinc-500">Q{index + 1}</span>
            {collapsed && draft.questionText && (
              <span className="truncate text-xl text-zinc-700 dark:text-zinc-300">
                {draft.questionText}
              </span>
            )}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Select value={draft.type} onValueChange={(v) => handleSetType(v as QuestionType | "GROUP")}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>{typeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">Fill in the Blank</SelectItem>
              <SelectItem value="GROUP">Group</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-zinc-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="border-t border-zinc-200 p-5 pt-4 dark:border-zinc-700">
          {draft.type === "GROUP" ? (
            <GroupCardBody draft={draft} onChange={(d) => onChange(d)} />
          ) : (
            <LeafCardBody draft={draft} onChange={(d) => onChange(d)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Leaf body ─────────────────────────── */

function LeafCardBody({
  draft,
  onChange,
}: {
  draft: DraftLeafQuestion;
  onChange: (d: DraftLeafQuestion) => void;
}) {
  const detectedBlankCount = (draft.questionText.match(/\[BLANK\]/g) ?? []).length;

  function setQuestionText(text: string) {
    const blankCount = (text.match(/\[BLANK\]/g) ?? []).length;
    const newFillBlanks = Array.from(
      { length: blankCount },
      (_, i) => draft.fillBlanks[i] ?? []
    );
    onChange({ ...draft, questionText: text, fillBlanks: newFillBlanks });
  }

  return (
    <>
      <div className="mb-4 space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500">Question text</Label>
          <Textarea
            value={draft.questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={
              draft.type === "FILL_IN_THE_BLANK"
                ? "Exp: A child born in late July to parents who defied Voldemort [BLANK] times…"
                : "Exp: What is the capital of France?"
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
                  {detectedBlankCount} blank{detectedBlankCount > 1 ? "s" : ""} detected.
                </span>
              )}
            </p>
          )}
        </div>
        <AudioUploader
          audioUrl={draft.audioUrl}
          onChange={(url) => onChange({ ...draft, audioUrl: url })}
        />
      </div>

      {draft.type === "MULTIPLE_CHOICE" ? (
        <McOptionsEditor draft={draft} onChange={onChange} />
      ) : (
        <FillBlankEditor draft={draft} onChange={onChange} />
      )}

      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500">Explanation (optional)</Label>
        <Input
          value={draft.explain}
          onChange={(e) => onChange({ ...draft, explain: e.target.value })}
          placeholder="Exp: Paris is the capital of France."
          className="text-xl"
        />
      </div>
    </>
  );
}

/* ─────────────────────────── Group body ─────────────────────────── */

function GroupCardBody({
  draft,
  onChange,
}: {
  draft: DraftGroupQuestion;
  onChange: (d: DraftGroupQuestion) => void;
}) {
  function updateSubQuestion(idx: number, sub: DraftLeafQuestion) {
    onChange({
      ...draft,
      subQuestions: draft.subQuestions.map((s, i) => (i === idx ? sub : s)),
    });
  }

  function deleteSubQuestion(idx: number) {
    onChange({ ...draft, subQuestions: draft.subQuestions.filter((_, i) => i !== idx) });
  }

  function addSubQuestion(type: QuestionType) {
    onChange({ ...draft, subQuestions: [...draft.subQuestions, newLeafDraft(type)] });
  }

  return (
    <>
      <div className="mb-4 space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500">Context / Passage</Label>
          <Textarea
            value={draft.questionText}
            onChange={(e) => onChange({ ...draft, questionText: e.target.value })}
            placeholder="Exp: Read the following passage and answer the questions below…"
            rows={4}
          />
        </div>
        <AudioUploader
          audioUrl={draft.audioUrl}
          onChange={(url) => onChange({ ...draft, audioUrl: url })}
        />
      </div>

      <div className="mb-3 space-y-2">
        <Label className="text-xs text-zinc-500">Sub-questions</Label>
        {draft.subQuestions.length === 0 && (
          <p className="text-xs italic text-zinc-400">No sub-questions yet. Add one below.</p>
        )}
        <div className="space-y-2">
          {draft.subQuestions.map((sub, idx) => (
            <SubQuestionCard
              key={sub.id}
              draft={sub}
              index={idx}
              onChange={(d) => updateSubQuestion(idx, d)}
              onDelete={() => deleteSubQuestion(idx)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => addSubQuestion("MULTIPLE_CHOICE")}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add MC
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => addSubQuestion("FILL_IN_THE_BLANK")}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Fill Blank
        </Button>
      </div>
    </>
  );
}
