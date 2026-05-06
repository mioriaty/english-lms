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

const hasPassage = (group: GroupQuestion) =>
  !!(
    group.question.text ||
    group.question.audio ||
    group.question.image ||
    group.question.description
  );

export function GroupQuestionCard({
  group,
  startIndex,
  answers,
  submitted,
  result,
  onToggleOption,
  onChangeBlank,
}: GroupQuestionCardProps) {
  const showPassage = hasPassage(group);

  return (
    <Card className="overflow-clip">
      <div
        className={
          showPassage
            ? "flex flex-col md:flex-row md:items-stretch md:divide-x md:divide-zinc-200 dark:md:divide-zinc-700"
            : undefined
        }
      >
        {/* ── Left: Passage ── */}
        {showPassage && (
          <div className="w-full border-b border-zinc-200 dark:border-zinc-700 md:w-[60%] md:border-b-0">
            <div className="px-6 py-6 md:sticky md:top-4 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
              {group.question.audio && (
                <audio
                  controls
                  src={group.question.audio}
                  className="mb-4 w-full"
                />
              )}
              {group.question.image && (
                <ImageZoom
                  src={group.question.image}
                  className="mb-4 max-h-72 w-auto rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
                />
              )}
              {group.question.text && (
                <div
                  className="prose prose-zinc prose-xl dark:prose-invert mb-2 max-w-none font-semibold leading-snug text-zinc-900 dark:text-zinc-100"
                  dangerouslySetInnerHTML={{ __html: group.question.text }}
                />
              )}
              {group.question.description && (
                <div
                  className="prose prose-zinc prose-xl dark:prose-invert max-w-none leading-relaxed text-zinc-700 dark:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: group.question.description }}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Right: Sub-questions ── */}
        <div
          className={
            showPassage ? "min-w-0 w-full overflow-hidden md:w-[40%]" : "w-full"
          }
        >
          {group.subQuestions.map((sub, idx) => {
            const detail = result?.details.find((d) => d.questionId === sub.id);
            const isLast = idx === group.subQuestions.length - 1;
            return (
              <div
                key={sub.id}
                className={
                  isLast
                    ? undefined
                    : "border-b border-zinc-200 dark:border-zinc-700"
                }
              >
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
        </div>
      </div>
    </Card>
  );
}
