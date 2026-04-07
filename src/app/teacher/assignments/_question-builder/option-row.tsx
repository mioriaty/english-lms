import { X } from "lucide-react";
import { Input } from "@/libs/components/ui/input";

interface OptionRowProps {
  value: string;
  index: number;
  isCorrect: boolean;
  onChangeValue: (v: string) => void;
  onToggleCorrect: () => void;
  onDelete: () => void;
}

export function OptionRow({ value, index, isCorrect, onChangeValue, onToggleCorrect, onDelete }: OptionRowProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleCorrect}
        title="Mark as correct answer"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
          isCorrect
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-zinc-300 text-zinc-400 hover:border-zinc-400 dark:border-zinc-600"
        }`}
      >
        {String.fromCharCode(65 + index)}
      </button>
      <Input
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={`Option ${String.fromCharCode(65 + index)}`}
        className="flex-1"
      />
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
