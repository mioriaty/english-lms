import { X } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { MiniRichTextEditor } from "@/libs/components/mini-rich-text-editor";

interface OptionRowProps {
  value: string;
  index: number;
  isCorrect: boolean;
  onChangeValue: (v: string) => void;
  onToggleCorrect: () => void;
  onDelete: () => void;
}

export function OptionRow({
  value,
  index,
  isCorrect,
  onChangeValue,
  onToggleCorrect,
  onDelete,
}: OptionRowProps) {
  return (
    <div className="flex items-start gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={onToggleCorrect}
        title="Mark as correct answer"
        className={`mt-1.5 h-6 w-6 shrink-0 rounded-full border-2 p-0 text-xs font-bold transition-colors ${
          isCorrect
            ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-500 hover:text-white"
            : "border-zinc-300 bg-transparent text-zinc-400 hover:border-zinc-400 hover:bg-transparent dark:border-zinc-600"
        }`}
      >
        {String.fromCharCode(65 + index)}
      </Button>
      <div className="flex-1">
        <MiniRichTextEditor
          value={value}
          onChange={onChangeValue}
          placeholder={`Option ${String.fromCharCode(65 + index)}`}
          minHeight="40px"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-1 h-7 w-7 shrink-0 text-zinc-400 hover:text-red-500"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
