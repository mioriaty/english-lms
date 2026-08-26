"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { BlankResult } from "@/core/lms/application/grade-submission";

interface FillBlankInlineProps {
  template: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  questionId: string;
  blankResults?: BlankResult[];
}

/**
 * Build HTML string with [BLANK] replaced by <input> elements.
 * Values are NOT embedded here — synced imperatively via DOM refs
 * to avoid replacing innerHTML (losing focus) on every keystroke.
 */
function buildInputHtml(
  template: string,
  disabled: boolean,
  blankResults?: BlankResult[]
): { html: string; blankCount: number } {
  let blankCount = 0;

  const html = template.replace(/\[BLANK\]/g, () => {
    const i = blankCount++;
    const result = blankResults?.[i];
    const isReview = !!result;

    const classes = [
      "inline-block min-w-[8rem] border-b bg-transparent px-1 pb-0.5 text-center focus:outline-none dark:text-zinc-100",
      !isReview
        ? "border-zinc-400 focus:border-[#2F5B94] dark:border-zinc-500"
        : "",
      isReview && result.isCorrect ? "border-[#2F5B94] text-[#2F5B94]" : "",
      isReview && !result.isCorrect
        ? "border-zinc-300 text-zinc-400 line-through dark:border-zinc-600"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const disabledAttr = disabled ? " disabled" : "";
    return `<input data-blank="${i}" type="text" autocomplete="off" aria-label="Blank ${i + 1}" class="${classes}"${disabledAttr} />`;
  });

  return { html, blankCount };
}

export function FillBlankInline({
  template,
  values,
  onChange,
  disabled,
  questionId,
  blankResults,
}: FillBlankInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Only rebuild HTML when structure-affecting props change — NOT on every keystroke
  const { html, blankCount } = useMemo(
    () => buildInputHtml(template, disabled, blankResults),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template, disabled, blankResults]
  );

  const hasPlaceholder = blankCount > 0;


  // Sync React state → DOM only when html structure changes (initial mount or after submit).
  // Must NOT run on every render — that would overwrite user's in-progress typing.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container
      .querySelectorAll<HTMLInputElement>("[data-blank]")
      .forEach((input) => {
        const i = Number(input.dataset.blank);
        input.value = valuesRef.current[i] ?? "";
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);


  // Assign questionId to first blank for label association
  useEffect(() => {
    const first = containerRef.current?.querySelector<HTMLInputElement>(
      '[data-blank="0"]'
    );
    if (first) first.id = questionId;
  }, [questionId, html]);

  // Event delegation — native listener avoids React controlled-input conflict
  const handleInput = useCallback(
    (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.dataset.blank === undefined) return;
      const i = Number(input.dataset.blank);
      const next = [...valuesRef.current];
      next[i] = input.value;
      onChange(next);
    },
    [onChange]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("input", handleInput);
    return () => container.removeEventListener("input", handleInput);
  }, [handleInput, html]);

  const hasWrongBlanks = blankResults?.some((r) => !r.isCorrect);

  // No [BLANK] markers → single free-text input below the passage
  if (!hasPlaceholder) {
    return (
      <div className="space-y-3">
        <div
          className="prose prose-zinc prose-xl dark:prose-invert max-w-none leading-relaxed text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: template }}
        />
        <input
          id={questionId}
          type="text"
          value={values[0] ?? ""}
          onChange={(e) => {
            const next = [...values];
            next[0] = e.target.value;
            onChange(next);
          }}
          disabled={disabled}
          autoComplete="off"
          placeholder="Type your answer…"
          className="border-b border-zinc-400 bg-transparent px-1 pb-0.5 text-xl focus:border-[#2F5B94] focus:outline-none dark:border-zinc-500 dark:text-zinc-100"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Full HTML structure (ol/li/p) preserved — inputs injected inline */}
      <div
        ref={containerRef}
        className="prose prose-zinc prose-xl dark:prose-invert max-w-none leading-relaxed text-zinc-700 dark:text-zinc-300"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {hasWrongBlanks && blankResults && (
        <div className="space-y-0.5 pt-1">
          {blankResults.map((r, i) =>
            !r.isCorrect ? (
              <p key={i} className="text-xl">
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
