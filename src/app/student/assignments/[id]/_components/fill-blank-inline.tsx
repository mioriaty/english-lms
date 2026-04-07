import { CheckCircle2, XCircleIcon } from "lucide-react";
import { cn } from "@/libs/utils/string";
import type { BlankResult } from "@/core/lms/application/grade-submission";

type Segment = { kind: "text"; text: string } | { kind: "blank"; idx: number };

function parseSegments(template: string): { segments: Segment[]; blankCount: number } {
  const segments: Segment[] = [];
  let blankCount = 0;
  for (const part of template.split(/(\[BLANK\])/)) {
    if (part === "[BLANK]") {
      segments.push({ kind: "blank", idx: blankCount++ });
    } else if (part) {
      segments.push({ kind: "text", text: part });
    }
  }
  return { segments, blankCount };
}

interface FillBlankInlineProps {
  template: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  questionId: string;
  blankResults?: BlankResult[];
}

export function FillBlankInline({ template, values, onChange, disabled, questionId, blankResults }: FillBlankInlineProps) {
  const { segments, blankCount } = parseSegments(template);
  const hasPlaceholder = blankCount > 0;

  function updateValue(idx: number, v: string) {
    const next = [...values];
    next[idx] = v;
    onChange(next);
  }

  if (!hasPlaceholder) {
    return (
      <div className="space-y-3">
        <p className="font-serif italic leading-relaxed text-zinc-700 dark:text-zinc-300">{template}</p>
        <input
          id={questionId}
          type="text"
          value={values[0] ?? ""}
          onChange={(e) => updateValue(0, e.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Type your answer…"
          className="border-b border-zinc-400 bg-transparent px-1 pb-0.5 text-sm focus:border-[#2F5B94] focus:outline-none dark:border-zinc-500 dark:text-zinc-100"
        />
      </div>
    );
  }

  const hasWrongBlanks = blankResults?.some((r) => !r.isCorrect);

  return (
    <div className="space-y-2">
      <p className="font-serif italic leading-relaxed text-zinc-700 dark:text-zinc-300">
        {segments.map((seg, i) => {
          if (seg.kind === "text") return <span key={i}>{seg.text}</span>;

          const result = blankResults?.[seg.idx];
          const isReview = !!result;

          return (
            <span key={i} className="mx-1 inline-flex items-center gap-0.5">
              <input
                type="text"
                id={seg.idx === 0 ? questionId : undefined}
                value={values[seg.idx] ?? ""}
                onChange={(e) => updateValue(seg.idx, e.target.value)}
                disabled={disabled}
                autoComplete="off"
                aria-label={`Blank ${seg.idx + 1}`}
                className={cn(
                  "inline-block min-w-35 border-b bg-transparent px-1 pb-0.5 text-center not-italic focus:outline-none dark:text-zinc-100",
                  !isReview && "border-zinc-400 focus:border-[#2F5B94] dark:border-zinc-500",
                  isReview && result.isCorrect && "border-[#2F5B94] text-[#2F5B94]",
                  isReview && !result.isCorrect && "border-zinc-300 text-zinc-400 line-through dark:border-zinc-600"
                )}
              />
              {isReview && result.isCorrect && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F5B94]" aria-hidden="true" />
              )}
              {isReview && !result.isCorrect && (
                <XCircleIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
              )}
            </span>
          );
        })}
      </p>

      {hasWrongBlanks && blankResults && (
        <div className="space-y-0.5 pt-1">
          {blankResults.map((r, i) =>
            !r.isCorrect ? (
              <p key={i} className="text-sm">
                <span className="text-zinc-500">Blank {i + 1} — correct: </span>
                <span className="font-semibold" style={{ color: "#2F5B94" }}>
                  {r.correctAnswers.join(" / ")}
                </span>
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
