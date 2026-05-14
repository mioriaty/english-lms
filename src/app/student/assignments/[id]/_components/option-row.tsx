import { CheckCircle2, XCircleIcon } from "lucide-react";
import { cn } from "@/libs/utils/string";

export type ReviewMode = "correct" | "missed" | "wrong" | "normal";

export function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

interface OptionRowProps {
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  reviewMode?: ReviewMode;
}

export function OptionRow({
  label,
  text,
  selected,
  disabled,
  onClick,
  reviewMode = "normal",
}: OptionRowProps) {
  const isReview = reviewMode !== "normal";

  const rowClass = cn(
    "flex w-full items-center overflow-hidden rounded border text-left text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    !isReview && selected && "border-[#2F5B94] bg-[#EDF2F9] text-[#2F5B94] dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300",
    !isReview &&
      !selected &&
      "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
    reviewMode === "correct" && "border-[#2F5B94] bg-[#EDF2F9] text-[#2F5B94] dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300",
    reviewMode === "missed" &&
      "border-dashed border-[#2F5B94] bg-white text-[#2F5B94] opacity-70 dark:border-blue-500 dark:bg-zinc-900 dark:text-blue-400",
    reviewMode === "wrong" &&
      "border-zinc-300 bg-zinc-100 text-zinc-500 line-through dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500",
    disabled && "cursor-default"
  );

  const badgeClass = cn(
    "flex h-full min-w-13 items-center justify-center border-r px-3 py-3.5 font-semibold",
    !isReview && selected && "border-[#2F5B94] text-[#2F5B94] dark:border-blue-500 dark:text-blue-300",
    !isReview &&
      !selected &&
      "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
    reviewMode === "correct" && "border-[#2F5B94] text-[#2F5B94] dark:border-blue-500 dark:text-blue-300",
    reviewMode === "missed" && "border-[#2F5B94] text-[#2F5B94] dark:border-blue-500 dark:text-blue-400",
    reviewMode === "wrong" && "border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500"
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={rowClass}
    >
      <span className={badgeClass}>{label}</span>
      <span className="flex-1 px-4 py-3.5 prose prose-zinc prose-xl dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: text }} />
      {((!isReview && selected) || reviewMode === "correct") && (
        <CheckCircle2
          className="mr-3 h-5 w-5 shrink-0 text-[#2F5B94]"
          aria-hidden="true"
        />
      )}
      {reviewMode === "missed" && (
        <CheckCircle2
          className="mr-3 h-5 w-5 shrink-0 text-[#2F5B94] opacity-60"
          aria-hidden="true"
        />
      )}
      {reviewMode === "wrong" && (
        <XCircleIcon
          className="mr-3 h-5 w-5 shrink-0 text-zinc-400"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
