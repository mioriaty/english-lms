"use client";

import { Music } from "lucide-react";
import { useAudioConverter } from "../hooks/use-audio-converter";
import { ConverterInputCard } from "./converter-input-card";
import { JobHistoryList } from "./job-history-list";

export function AudioConverterContainer() {
  const {
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
  } = useAudioConverter();

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

      <ConverterInputCard
        url={url}
        setUrl={setUrl}
        isSubmitting={isSubmitting}
        submitUrl={submitUrl}
        submitFile={submitFile}
        dragActive={dragActive}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        fileInputRef={fileInputRef}
      />

      <JobHistoryList jobs={jobs} deleteJob={deleteJob} />
    </div>
  );
}
