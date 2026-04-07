import { Card, CardContent } from "@/libs/components/ui/card";
import { cn } from "@/libs/utils/string";
import type { LeafQuestion } from "@/core/lms/domain/question.types";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";
import { OptionRow, optionLabel, type ReviewMode } from "./option-row";
import { FillBlankInline } from "./fill-blank-inline";
import { ImageZoom } from "./image-zoom";

interface QuestionCardProps {
  question: LeafQuestion;
  index: number;
  answer: string | string[] | undefined;
  submitted: boolean;
  result: { score: number; details: GradingDetailRow[] } | null;
  onToggleOption: (option: string) => void;
  onChangeBlank: (values: string[]) => void;
}

function getOptionReviewMode(
  opt: string,
  isChecked: boolean,
  detail: GradingDetailRow | undefined
): ReviewMode {
  if (!detail) return "normal";
  const correctAnswers = detail.correctAnswers ?? [];
  const isCorrectOpt = correctAnswers.includes(opt);
  if (isCorrectOpt && isChecked) return "correct";
  if (isCorrectOpt && !isChecked) return "missed";
  if (!isCorrectOpt && isChecked) return "wrong";
  return "normal";
}

interface QuestionCardContentProps {
  question: LeafQuestion;
  index: number;
  answer: string | string[] | undefined;
  submitted: boolean;
  detail: GradingDetailRow | undefined;
  onToggleOption: (option: string) => void;
  onChangeBlank: (values: string[]) => void;
}

export function QuestionCardContent({
  question,
  answer,
  submitted,
  detail,
  onToggleOption,
  onChangeBlank,
}: QuestionCardContentProps) {
  return (
    <div className="space-y-5">
      {question.type === "MULTIPLE_CHOICE" ? (
        <p className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          {question.question.text}
        </p>
      ) : (
        <p className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          Fill in the blank
        </p>
      )}

      {question.question.description && (
        <p className="text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">
          {question.question.description}
        </p>
      )}

      {question.question.audio && (
        <audio controls src={question.question.audio} className="w-full" />
      )}

      {question.question.image && (
        <ImageZoom
          src={question.question.image}
          className="max-h-72 w-auto rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
        />
      )}

      {question.type === "MULTIPLE_CHOICE" ? (
        <fieldset className="space-y-2" disabled={submitted}>
          <legend className="sr-only">Choose all correct answers</legend>
          {question.options.map((opt, optIdx) => {
            const isChecked = Array.isArray(answer)
              ? answer.includes(opt)
              : answer === opt;
            const reviewMode = submitted
              ? getOptionReviewMode(opt, isChecked, detail)
              : "normal";

            return (
              <OptionRow
                key={opt}
                label={optionLabel(optIdx)}
                text={opt}
                selected={isChecked}
                disabled={submitted}
                onClick={() => onToggleOption(opt)}
                reviewMode={reviewMode}
              />
            );
          })}
        </fieldset>
      ) : (
        <div
          className={cn(
            "rounded border p-4",
            submitted
              ? detail?.isCorrect
                ? "border-[#2F5B94] bg-[#EDF2F9]"
                : "border-zinc-300"
              : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
          )}
        >
          <FillBlankInline
            template={question.question.text}
            values={(answer as string[] | undefined) ?? []}
            onChange={onChangeBlank}
            disabled={submitted}
            questionId={question.id}
            blankResults={detail?.blankResults}
          />
        </div>
      )}

      {submitted && question.explain && (
        <div className="rounded-md border border-b-blue-200 bg-blue-50 px-4 py-3 text-xl text-blue-800 dark:border-b-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
          <span className="font-semibold">Explain: </span>
          {question.explain}
        </div>
      )}
    </div>
  );
}

export function QuestionCard({
  question,
  index,
  answer,
  submitted,
  result,
  onToggleOption,
  onChangeBlank,
}: QuestionCardProps) {
  const detail = result?.details.find((d) => d.questionId === question.id);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <QuestionCardContent
          question={question}
          index={index}
          answer={answer}
          submitted={submitted}
          detail={detail}
          onToggleOption={onToggleOption}
          onChangeBlank={onChangeBlank}
        />
      </CardContent>
    </Card>
  );
}
