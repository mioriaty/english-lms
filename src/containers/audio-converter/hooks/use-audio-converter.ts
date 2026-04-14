import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { ConversionJob } from "@/core/audio-converter/domain/repositories/audio-converter.repository";

export type JobWithPoll = ConversionJob & { polling?: boolean };

export function useAudioConverter() {
  const [url, setUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobs, setJobs] = useState<JobWithPoll[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  // Auto-download: trigger browser Save dialog
  const triggerDownload = useCallback((jobId: string, filename: string) => {
    const a = document.createElement("a");
    a.href = `/api/admin/audio-converter/${jobId}/download`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // Polling
  const startPolling = useCallback(
    (jobId: string) => {
      if (pollTimers.current.has(jobId)) return;

      const timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/audio-converter/${jobId}`);
          if (!res.ok) return;
          const updated: ConversionJob = await res.json();

          setJobs((prev) =>
            prev.map((j) => (j.jobId === jobId ? { ...j, ...updated } : j)),
          );

          if (updated.status === "completed" || updated.status === "failed") {
            clearInterval(timer);
            pollTimers.current.delete(jobId);

            if (updated.status === "completed") {
              // Auto-open browser Save dialog
              if (updated.outputFilename) {
                triggerDownload(jobId, updated.outputFilename);
              }
              toast.success("Conversion complete! Saving file…");
            } else {
              toast.error(
                `Conversion failed: ${updated.error ?? "Unknown error"}`,
              );
            }
          }
        } catch {
          // silent
        }
      }, 2000);

      pollTimers.current.set(jobId, timer);
    },
    [triggerDownload],
  );

  // Submit URL
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

  // Submit File
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

  // Drag & drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) submitFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  // Delete job
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

  return {
    url,
    setUrl,
    dragActive,
    isSubmitting,
    jobs,
    fileInputRef,
    submitUrl,
    submitFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    deleteJob,
  };
}
