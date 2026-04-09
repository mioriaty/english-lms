"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
import type { DraftLeafQuestion } from "./types";
import { McOptionsEditor } from "./mc-options-editor";
import { FillBlankEditor } from "./fill-blank-editor";
import { AudioUploader } from "./audio-uploader";
import { ImageUploader } from "../_components/image-uploader";

interface SubQuestionCardProps {
  draft: DraftLeafQuestion;
  index: number;
  onChange: (d: DraftLeafQuestion) => void;
  onDelete: () => void;
}

export function SubQuestionCard({
  draft,
  index,
  onChange,
  onDelete,
}: SubQuestionCardProps) {
  const [collapsed, setCollapsed] = useState(
    () => draft.questionText.trim().length > 0
  );

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

  return (
    <div className="w-full min-w-0 border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCollapsed((v) => !v)}
            className="h-auto min-w-0 flex-1 justify-start px-1 py-0 font-normal"
          >
            <span className="shrink-0 text-base font-semibold text-zinc-500">
              {index + 1}.
            </span>
            {collapsed && draft.questionText && (
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
            onValueChange={(v) => setType(v as QuestionType)}
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="FILL_IN_THE_BLANK">
                Fill in the Blank
              </SelectItem>
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
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-zinc-200 px-3 pb-3 pt-2.5 dark:border-zinc-700">
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
                    ? "Exp: The answer is [BLANK] and [BLANK]."
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
                      {detectedBlankCount} blank
                      {detectedBlankCount > 1 ? "s" : ""} detected.
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
        </div>
      )}
    </div>
  );
}
