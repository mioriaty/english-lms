import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";
import { cn } from "@/libs/utils/string";
import type { GradingDetailRow } from "@/core/lms/application/grade-submission";

interface ResultCardProps {
  result: {
    score: number;
    details: GradingDetailRow[];
  };
}

export function ResultCard({ result }: ResultCardProps) {
  const allCorrect = result.details.every((d) => d.isCorrect);

  return (
    <Card style={{ borderColor: "#2F5B9440", backgroundColor: "#EDF2F940" }}>
      <CardHeader>
        <CardTitle className="text-lg">Results</CardTitle>
        <p className="text-2xl font-bold" style={{ color: "#2F5B94" }}>
          {result.score.toFixed(1)} pts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {allCorrect ? (
          <p className="font-medium" style={{ color: "#2F5B94" }}>
            🎉 Congratulations — all correct!
          </p>
        ) : (
          <>
            <p className="text-xl font-medium text-zinc-700 dark:text-zinc-300">
              Incorrect answers — see explanation
            </p>
            <ul className="space-y-3 text-xl">
              {result.details
                .filter((d) => !d.isCorrect)
                .map((d) => (
                  <li
                    key={d.questionId}
                    className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="mb-1 text-xl font-medium text-zinc-800 dark:text-zinc-200">
                      {d.questionText}
                    </p>
                    {d.blankResults ? (
                      <div className="mt-1 space-y-1">
                        {d.blankResults.map((r, i) => (
                          <p key={i}>
                            <span className="text-zinc-500">
                              Blank {i + 1}:{" "}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                r.isCorrect && "text-[#2F5B94]"
                              )}
                            >
                              &quot;{r.studentAnswer || "—"}&quot;
                            </span>
                            {!r.isCorrect && (
                              <>
                                <span className="mx-1 text-zinc-400">→</span>
                                <span
                                  className="font-semibold"
                                  style={{ color: "#2F5B94" }}
                                >
                                  {r.correctAnswers.join(" / ")}
                                </span>
                              </>
                            )}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1">
                        Your answer:{" "}
                        <span className="font-medium">
                          &quot;{d.studentAnswer || "—"}&quot;
                        </span>
                      </p>
                    )}
                    {d.explain && (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        {d.explain}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
