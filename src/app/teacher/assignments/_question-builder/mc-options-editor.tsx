import { Plus } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { FormItem, FormLabel } from "@/libs/components/ui/form";
import { OptionRow } from "./option-row";
import type { DraftLeafQuestion } from "./types";

interface McOptionsEditorProps {
  draft: DraftLeafQuestion;
  onChange: (d: DraftLeafQuestion) => void;
}

export function McOptionsEditor({ draft, onChange }: McOptionsEditorProps) {
  function setOption(i: number, value: string) {
    const options = [...draft.options];
    options[i] = value;
    const correct = draft.correct.filter((c) => options.includes(c));
    onChange({ ...draft, options, correct });
  }

  function addOption() {
    onChange({ ...draft, options: [...draft.options, ""] });
  }

  function deleteOption(i: number) {
    const removed = draft.options[i];
    const options = draft.options.filter((_, idx) => idx !== i);
    const correct = draft.correct.filter((c) => c !== removed);
    onChange({ ...draft, options, correct });
  }

  function toggleOptionCorrect(optionValue: string) {
    const correct = draft.correct.includes(optionValue)
      ? draft.correct.filter((c) => c !== optionValue)
      : [...draft.correct, optionValue];
    onChange({ ...draft, correct });
  }

  return (
    <FormItem className="mb-4">
      <FormLabel>Options <span className="font-normal text-zinc-400">(click the letter to mark correct)</span></FormLabel>
      <div className="space-y-2">
        {draft.options.map((opt, i) => (
          <OptionRow
            key={i}
            value={opt}
            index={i}
            isCorrect={draft.correct.includes(opt) && opt !== ""}
            onChangeValue={(v) => setOption(i, v)}
            onToggleCorrect={() => opt && toggleOptionCorrect(opt)}
            onDelete={() => deleteOption(i)}
          />
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-1 h-7 text-xs" onClick={addOption}>
        <Plus className="mr-1 h-3 w-3" />
        Add option
      </Button>
    </FormItem>
  );
}
