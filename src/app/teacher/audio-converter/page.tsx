"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Badge } from "@/libs/components/ui/badge";
import { Progress } from "@/libs/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/libs/components/ui/tabs";
import { Label } from "@/libs/components/ui/label";
import {
  Music,
  Link2,
  Upload,
  Download,
  Loader2,
  Trash2,
  FileAudio,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ConversionJob } from "@/core/audio-converter/domain/repositories/audio-converter.repository";

type JobWithPoll = ConversionJob & { polling?: boolean };

export default function AudioConverterPage() {
  const [url, setUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobs, setJobs] = useState<JobWithPoll[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // ──────────────────────────────────────────────
  // Auto-download: trigger browser Save dialog
  // ──────────────────────────────────────────────
  const triggerDownload = useCallback((filename: string) => {
    const a = document.createElement("a");
    a.href = `/converted/${filename}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // ──────────────────────────────────────────────
  // Polling
  // ──────────────────────────────────────────────
  const startPolling = useCallback((jobId: string) => {
    if (pollTimers.current.has(jobId)) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/audio-converter/${jobId}`);
        if (!res.ok) return;
        const updated: ConversionJob = await res.json();

        setJobs((prev) =>
          prev.map((j) => (j.jobId === jobId ? { ...j, ...updated } : j))
        );

        if (updated.status === "completed" || updated.status === "failed") {
          clearInterval(timer);
          pollTimers.current.delete(jobId);

          if (updated.status === "completed") {
            // Auto-open browser Save dialog
            if (updated.outputFilename) triggerDownload(updated.outputFilename);
            toast.success("Conversion complete! Saving file…");
          } else {
            toast.error(`Conversion failed: ${updated.error ?? "Unknown error"}`);
          }
        }
      } catch {
        // silent
      }
    }, 2000);

    pollTimers.current.set(jobId, timer);
  }, [triggerDownload]);

  // ──────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────
  const submitUrl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid M3U8 URL");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/audio-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: url }),
      });
      const data: ConversionJob = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setJobs((prev) => [data, ...prev]);
      startPolling(data.jobId);
      setUrl("");
      toast.info("Conversion started!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFile = async (file: File) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/audio-converter", {
        method: "POST",
        body: formData,
      });
      const data: ConversionJob = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setJobs((prev) => [data, ...prev]);
      startPolling(data.jobId);
      toast.info("Conversion started!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────
  // Drag & drop
  // ──────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) submitFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  // ──────────────────────────────────────────────
  // Delete job
  // ──────────────────────────────────────────────
  const deleteJob = async (jobId: string) => {
    try {
      await fetch(`/api/admin/audio-converter/${jobId}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      // stop polling if active
      const timer = pollTimers.current.get(jobId);
      if (timer) {
        clearInterval(timer);
        pollTimers.current.delete(jobId);
      }
    } catch {
      toast.error("Failed to delete job");
    }
  };

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  function StatusBadge({ status }: { status: ConversionJob["status"] }) {
    const map = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      processing: { label: "Processing", variant: "default" as const, icon: Loader2 },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle2 },
      failed: { label: "Failed", variant: "destructive" as const, icon: XCircle },
    };
    const { label, variant, icon: Icon } = map[status];
    return (
      <Badge
        variant={variant}
        className={
          status === "completed"
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : ""
        }
      >
        <Icon
          className={`mr-1 size-3 ${status === "processing" ? "animate-spin" : ""}`}
        />
        {label}
      </Badge>
    );
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
          <Music className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Download Audio</h1>
          <p className="text-sm text-muted-foreground">
            Convert M3U8 streams or video files to MP3
          </p>
        </div>
      </div>

      {/* Input card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New Conversion</CardTitle>
          <CardDescription>
            Provide an M3U8 link or upload a media file to convert it to MP3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="url" className="flex-1 gap-2">
                <Link2 className="size-4" />
                Paste URL
              </TabsTrigger>
              <TabsTrigger value="file" className="flex-1 gap-2">
                <Upload className="size-4" />
                Upload File
              </TabsTrigger>
            </TabsList>

            {/* URL tab */}
            <TabsContent value="url">
              <div className="space-y-3">
                <Label htmlFor="m3u8-url">M3U8 Stream URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="m3u8-url"
                    placeholder="https://example.com/stream/playlist.m3u8"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitUrl()}
                    disabled={isSubmitting}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={submitUrl}
                    disabled={isSubmitting || !url.trim()}
                    className="shrink-0"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Music className="size-4" />
                    )}
                    Convert
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports HLS (.m3u8), direct audio/video URLs
                </p>
              </div>
            </TabsContent>

            {/* File tab */}
            <TabsContent value="file">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10 transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <FileAudio className="size-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {dragActive
                      ? "Drop your file here"
                      : "Click or drag file to upload"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    .m3u8, .ts, .mp4, .avi, .mkv supported
                  </p>
                </div>
                {isSubmitting && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Uploading…
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".m3u8,.ts,.mp4,.avi,.mkv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) submitFile(file);
                  e.target.value = "";
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Jobs list */}
      {jobs.length > 0 && (
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
                          <Progress
                            value={job.progress ?? 0}
                            className="h-1.5"
                          />
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
                            href={`/converted/${job.outputFilename}`}
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
      )}

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Music className="size-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No conversions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste an M3U8 URL or upload a file to get started
          </p>
        </div>
      )}
    </div>
  );
}
