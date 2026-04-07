import { Card, CardContent } from "@/libs/components/ui/card";
import type { GroupQuestion } from "@/core/lms/domain/question.types";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";
import { QuestionCardContent } from "./question-card";
import { ImageZoom } from "./image-zoom";

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
    <Card className="overflow-hidden">
      {/* Context / Passage */}
      {(group.question.text || group.question.audio || group.question.image || group.question.description) && (
        <div className="-mt-4 border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {group.question.audio && (
            <audio
              controls
              src={group.question.audio}
              className="mb-3 w-full"
            />
          )}
          {group.question.image && (
            <ImageZoom
              src={group.question.image}
              className="mb-3 max-h-72 w-auto rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
            />
          )}
          {group.question.text && (
            <p className="font-serif leading-relaxed text-zinc-700 dark:text-zinc-300">
              {group.question.text}
            </p>
          )}
          {group.question.description && (
            <p className="mt-2 text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">
              {group.question.description}
            </p>
          )}
        </div>
      )}

      {/* Sub-questions */}
      {group.subQuestions.map((sub, idx) => {
        const detail = result?.details.find((d) => d.questionId === sub.id);
        return (
          <div key={sub.id}>
            <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
            <CardContent className="p-6">
              <QuestionCardContent
                question={sub}
                index={startIndex + idx}
                answer={answers[sub.id]}
                submitted={submitted}
                detail={detail}
                onToggleOption={(opt) => onToggleOption(sub.id, opt)}
                onChangeBlank={(v) => onChangeBlank(sub.id, v)}
              />
            </CardContent>
          </div>
        );
      })}
    </Card>
  );
}
