import { Card, CardContent } from "@/libs/components/ui/card";
import type { GroupQuestion } from "@/core/lms/domain/question.types";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";
import { QuestionCard } from "./question-card";

interface GroupQuestionCardProps {
  group: GroupQuestion;
  startIndex: number;
  answers: Record<string, string | string[]>;
  submitted: boolean;
  result: { score: number; details: GradingDetailRow[] } | null;
  onToggleOption: (questionId: string, option: string) => void;
  onChangeBlank: (questionId: string, values: string[]) => void;
}

export function GroupQuestionCard({
  group,
  startIndex,
  answers,
  submitted,
  result,
  onToggleOption,
  onChangeBlank,
}: GroupQuestionCardProps) {
  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-zinc-300 dark:border-zinc-600">
        <CardContent className="space-y-3 p-5">
          {group.question.audio && (
            <audio controls src={group.question.audio} className="w-full" />
          )}
          {group.question.text && (
            <p className="whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300">
              {group.question.text}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
        {group.subQuestions.map((sub, idx) => (
          <QuestionCard
            key={sub.id}
            question={sub}
            index={startIndex + idx}
            answer={answers[sub.id]}
            submitted={submitted}
            result={result}
            onToggleOption={(opt) => onToggleOption(sub.id, opt)}
            onChangeBlank={(v) => onChangeBlank(sub.id, v)}
          />
        ))}
      </div>
    </div>
  );
}
