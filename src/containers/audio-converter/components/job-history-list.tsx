import { Button } from "@/libs/components/ui/button";
import { Card, CardContent } from "@/libs/components/ui/card";
import { Progress } from "@/libs/components/ui/progress";
import { Download, Trash2, AlertCircle, Music } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { JobWithPoll } from "../hooks/use-audio-converter";

interface JobHistoryListProps {
  jobs: JobWithPoll[];
  deleteJob: (jobId: string) => void;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function JobHistoryList({ jobs, deleteJob }: JobHistoryListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Music className="size-7 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium">No conversions yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste an M3U8 URL or upload a file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Conversion History ({jobs.length})
      </h2>
      <div className="space-y-2">
        {jobs.map((job) => (
          <Card key={job.jobId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Top row: badge + time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>

                  {/* Job ID */}
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    ID: {job.jobId}
                  </p>

                  {/* Progress bar */}
                  {job.status === "processing" && (
                    <div className="space-y-1">
                      <Progress value={job.progress ?? 0} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {job.progress ?? 0}% processed…
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {job.status === "failed" && job.error && (
                    <div className="flex items-start gap-1.5 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                      <AlertCircle className="mt-0.5 size-3 shrink-0" />
                      <span className="break-words">{job.error}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {job.status === "completed" && job.outputFilename && (
                    <Button size="sm" variant="default" asChild>
                      <a
                        href={`/api/admin/audio-converter/${job.jobId}/download`}
                        download
                        className="flex items-center gap-1.5"
                      >
                        <Download className="size-3.5" />
                        Download MP3
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteJob(job.jobId)}
                    disabled={job.status === "processing"}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
