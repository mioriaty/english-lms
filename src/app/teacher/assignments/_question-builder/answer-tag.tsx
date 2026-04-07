import { X } from "lucide-react";
import { Badge } from "@/libs/components/ui/badge";

interface AnswerTagProps {
  value: string;
  onDelete: () => void;
}

export function AnswerTag({ value, onDelete }: AnswerTagProps) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
      {value}
      <button type="button" onClick={onDelete} className="ml-1 rounded hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
