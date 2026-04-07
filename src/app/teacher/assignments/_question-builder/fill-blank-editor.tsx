"use client";

import { useEffect, useState } from "react";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { AnswerTag } from "./answer-tag";
import type { DraftLeafQuestion } from "./types";

interface FillBlankEditorProps {
  draft: DraftLeafQuestion;
  onChange: (d: DraftLeafQuestion) => void;
}

export function FillBlankEditor({ draft, onChange }: FillBlankEditorProps) {
  const [blankInputs, setBlankInputs] = useState<string[]>(() =>
    Array(draft.fillBlanks.length).fill("")
  );

  useEffect(() => {
    setBlankInputs((prev) =>
      Array.from({ length: draft.fillBlanks.length }, (_, i) => prev[i] ?? "")
    );
  }, [draft.fillBlanks.length]);

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

  if (draft.fillBlanks.length === 0) {
    return (
      <p className="mb-4 text-xs italic text-zinc-400">
        Thêm <code className="font-mono">[BLANK]</code> vào câu hỏi để cấu hình
        đáp án cho từng blank.
      </p>
    );
  }

  return (
    <div className="mb-4 space-y-4">
      {draft.fillBlanks.map((accepted, blankIdx) => (
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
              placeholder="Exp: three"
              className="h-8 text-xl"
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
      ))}
    </div>
  );
}
