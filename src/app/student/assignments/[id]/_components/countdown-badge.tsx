import { formatTime } from "../_hooks/use-countdown";

export function CountdownBadge({ seconds }: { seconds: number }) {
  const isWarning = seconds <= 60;
  const isCritical = seconds <= 10;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xl font-mono font-semibold tabular-nums transition-colors ${
        isCritical
          ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : isWarning
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      <span className="text-xs">⏱</span>
      {formatTime(seconds)}
    </div>
  );
}
