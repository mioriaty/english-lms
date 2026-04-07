"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
import type { DraftLeafQuestion } from "./types";
import { McOptionsEditor } from "./mc-options-editor";
import { FillBlankEditor } from "./fill-blank-editor";
import { AudioUploader } from "./audio-uploader";

interface SubQuestionCardProps {
  draft: DraftLeafQuestion;
  index: number;
  onChange: (d: DraftLeafQuestion) => void;
  onDelete: () => void;
}

export function SubQuestionCard({ draft, index, onChange, onDelete }: SubQuestionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const detectedBlankCount = (draft.questionText.match(/\[BLANK\]/g) ?? []).length;

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

  return (
    <div className="w-full min-w-0 border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className="shrink-0 text-sm font-semibold text-zinc-500">
              {index + 1}.
            </span>
            {collapsed && draft.questionText && (
              <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                {draft.questionText}
              </span>
            )}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            value={draft.type}
            onValueChange={(v) => setType(v as QuestionType)}
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">Fill in the Blank</SelectItem>
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
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-700">
          <div className="mb-4 space-y-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Question text</Label>
              <Textarea
                value={draft.questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={
                  draft.type === "FILL_IN_THE_BLANK"
                    ? "Exp: The answer is [BLANK] and [BLANK]."
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
        </div>
      )}
    </div>
  );
}
