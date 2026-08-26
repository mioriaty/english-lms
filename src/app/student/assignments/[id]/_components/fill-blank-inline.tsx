"use client";

import { useRef, useEffect, useMemo } from "react";
import type { BlankResult } from "@/core/lms/application/grade-submission";

interface FillBlankInlineProps {
  template: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  questionId: string;
  blankResults?: BlankResult[];
}

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
      !isReview ? "border-zinc-400 focus:border-[#2F5B94] dark:border-zinc-500" : "",
      isReview && result.isCorrect ? "border-[#2F5B94] text-[#2F5B94]" : "",
      isReview && !result.isCorrect ? "border-zinc-300 text-zinc-400 line-through dark:border-zinc-600" : "",
    ].filter(Boolean).join(" ");
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
  // Keep onChange ref fresh so handler never goes stale without re-attaching
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Rebuild HTML only when structure-affecting props change (not on every keystroke)
  const { html, blankCount } = useMemo(
    () => buildInputHtml(template, disabled, blankResults),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template, disabled, blankResults]
  );

  const hasPlaceholder = blankCount > 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set full HTML structure imperatively (ol/li/p preserved).
    // NOT using dangerouslySetInnerHTML so React never conflicts with innerHTML.
    container.innerHTML = html;

    // Set questionId on first blank for label association
    const first = container.querySelector<HTMLInputElement>('[data-blank="0"]');
    if (first) first.id = questionId;

    // Sync current values into DOM inputs
    container.querySelectorAll<HTMLInputElement>("[data-blank]").forEach((input) => {
      const i = Number(input.dataset.blank);
      input.value = valuesRef.current[i] ?? "";
    });

    // Define handler INSIDE effect so it closes over the stable refs.
    // onChangeRef.current is always the latest onChange — no stale closure.
    // No need to re-attach when onChange changes reference.
    function handleInput(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.dataset.blank === undefined) return;
      const i = Number(input.dataset.blank);
      const next = [...valuesRef.current];
      next[i] = input.value;
      onChangeRef.current(next);
    }

    container.addEventListener("input", handleInput);
    return () => container.removeEventListener("input", handleInput);
    // Re-run only when HTML structure changes (initial mount + submit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, questionId]);

  const hasWrongBlanks = blankResults?.some((r) => !r.isCorrect);

  // No [BLANK] markers — single free-text input below the passage
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
      {/* innerHTML managed imperatively in useEffect — React never conflicts */}
      <div
        ref={containerRef}
        className="prose prose-zinc prose-xl dark:prose-invert max-w-none leading-relaxed text-zinc-700 dark:text-zinc-300"
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
