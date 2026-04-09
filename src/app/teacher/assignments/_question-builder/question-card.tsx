"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { FormItem, FormLabel } from "@/libs/components/ui/form";
import { Textarea } from "@/libs/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/libs/components/ui/select";
import type { QuestionType } from "@/core/lms/domain/question.types";
import { cn } from "@/libs/utils/string";
import type {
  DraftQuestion,
  DraftLeafQuestion,
  DraftGroupQuestion,
} from "./types";
import { newLeafDraft } from "./types";
import { McOptionsEditor } from "./mc-options-editor";
import { FillBlankEditor } from "./fill-blank-editor";
import { AudioUploader } from "./audio-uploader";
import { ImageUploader } from "../_components/image-uploader";
import { SubQuestionCard } from "./sub-question-card";

interface QuestionCardProps {
  draft: DraftQuestion;
  index: number;
  onChange: (d: DraftQuestion) => void;
  onDelete: () => void;
}

export function QuestionCard({
  draft,
  index,
  onChange,
  onDelete,
}: QuestionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draft.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  function handleSetType(newType: QuestionType | "GROUP") {
    if (newType === "GROUP") {
      const next: DraftGroupQuestion = {
        id: draft.id,
        type: "GROUP",
        questionText: draft.questionText,
        description: draft.description,
        audioUrl: draft.audioUrl,
        imageUrl: draft.imageUrl,
        subQuestions: [newLeafDraft()],
      };
      onChange(next);
    } else if (draft.type === "GROUP") {
      const next: DraftLeafQuestion = {
        id: draft.id,
        type: newType,
        questionText: draft.questionText,
        description: "",
        audioUrl: draft.audioUrl,
        imageUrl: draft.imageUrl,
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
      className={cn(
        "w-full min-w-0 bg-white shadow-sm dark:bg-zinc-900",
        draft.type === "GROUP"
          ? "border border-zinc-200 border-l-4 border-l-blue-400 dark:border-zinc-700 dark:border-l-blue-500"
          : "border border-zinc-200 dark:border-zinc-700",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 cursor-grab touch-none text-zinc-400 active:cursor-grabbing"
            suppressHydrationWarning
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCollapsed((v) => !v)}
            className="h-auto flex-1 justify-start truncate px-1 py-0 font-normal"
          >
            {draft.questionText && (
              <span className="truncate text-base text-zinc-700 dark:text-zinc-300">
                {draft.questionText.length > 50
                  ? draft.questionText.slice(0, 50) + "..."
                  : draft.questionText}
              </span>
            )}
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            value={draft.type}
            onValueChange={(v) => handleSetType(v as QuestionType | "GROUP")}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>{typeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">
                Fill in the Blank
              </SelectItem>
              <SelectItem value="GROUP">Group</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
  const detectedBlankCount = (draft.questionText.match(/\[BLANK\]/g) ?? [])
    .length;

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
      <div className="mb-4 space-y-3">
        <FormItem>
          <Textarea
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
            placeholder="Description (optional)"
            rows={2}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Question text</FormLabel>
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
              Use{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
                [BLANK]
              </code>{" "}
              to mark the blank.
              {detectedBlankCount > 0 && (
                <span className="ml-1 font-medium text-zinc-500">
                  {detectedBlankCount} blank{detectedBlankCount > 1 ? "s" : ""}{" "}
                  detected.
                </span>
              )}
            </p>
          )}
        </FormItem>

        <FormItem>
          <AudioUploader
            audioUrl={draft.audioUrl}
            onChange={(url) => onChange({ ...draft, audioUrl: url })}
          />
        </FormItem>

        <FormItem>
          <ImageUploader
            imageUrl={draft.imageUrl}
            onChange={(url) => onChange({ ...draft, imageUrl: url })}
            label="Question image"
          />
        </FormItem>
      </div>

      {draft.type === "MULTIPLE_CHOICE" ? (
        <McOptionsEditor draft={draft} onChange={onChange} />
      ) : (
        <FillBlankEditor draft={draft} onChange={onChange} />
      )}

      <FormItem>
        <FormLabel>Explanation (optional)</FormLabel>
        <Input
          value={draft.explain}
          onChange={(e) => onChange({ ...draft, explain: e.target.value })}
          placeholder="Exp: Paris is the capital of France."
        />
      </FormItem>
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
    onChange({
      ...draft,
      subQuestions: draft.subQuestions.filter((_, i) => i !== idx),
    });
  }

  function addSubQuestion(type: QuestionType) {
    onChange({
      ...draft,
      subQuestions: [...draft.subQuestions, newLeafDraft(type)],
    });
  }

  return (
    <>
      <div className="mb-3 space-y-3">
        <FormItem>
          <FormLabel>Question text</FormLabel>
          <Textarea
            value={draft.questionText}
            onChange={(e) =>
              onChange({ ...draft, questionText: e.target.value })
            }
            placeholder="Exp: Read the following passage and answer the questions below…"
            rows={2}
            className="resize-y"
            required
          />
        </FormItem>

        <FormItem>
          <FormLabel>Context / Passage</FormLabel>
          <Textarea
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
            placeholder="Description (optional)"
            rows={2}
          />
        </FormItem>

        <FormItem>
          <AudioUploader
            audioUrl={draft.audioUrl}
            onChange={(url) => onChange({ ...draft, audioUrl: url })}
          />
        </FormItem>

        <FormItem>
          <ImageUploader
            imageUrl={draft.imageUrl}
            onChange={(url) => onChange({ ...draft, imageUrl: url })}
            label="Question image"
          />
        </FormItem>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FormLabel>
            Sub-questions
            {draft.subQuestions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-zinc-500 dark:bg-zinc-800">
                {draft.subQuestions.length}
              </span>
            )}
          </FormLabel>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => addSubQuestion("MULTIPLE_CHOICE")}
            >
              <Plus className="mr-0.5 h-3 w-3" />
              MC
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => addSubQuestion("FILL_IN_THE_BLANK")}
            >
              <Plus className="mr-0.5 h-3 w-3" />
              Fill Blank
            </Button>
          </div>
        </div>
        {draft.subQuestions.length === 0 ? (
          <p className="rounded border border-dashed border-zinc-200 py-3 text-center text-xs italic text-zinc-400 dark:border-zinc-700">
            No sub-questions yet. Add one above.
          </p>
        ) : (
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
        )}
      </div>
    </>
  );
}
