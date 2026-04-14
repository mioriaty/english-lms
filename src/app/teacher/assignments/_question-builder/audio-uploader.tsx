"use client";

import { useState } from "react";
import { Music, Upload, X } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { FormLabel } from "@/libs/components/ui/form";
import { MediaModal } from "../_components/media-modal";

interface AudioUploaderProps {
  audioUrl: string | null;
  onChange: (url: string | null) => void;
}

export function AudioUploader({ audioUrl, onChange }: AudioUploaderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const filename = audioUrl ? audioUrl.split("/").pop() : null;

  return (
    <div className="space-y-1.5">
      <FormLabel>
        Audio{" "}
        <span className="font-normal text-zinc-400">
          (MP3, maximum 20MB, optional)
        </span>
      </FormLabel>

      {audioUrl ? (
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
          <Music className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
            {filename}
          </span>
          <audio src={audioUrl} controls className="h-8 max-w-55 shrink-0" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-zinc-400 hover:text-red-500"
            aria-label="Remove audio"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setModalOpen(true)}
        >
          <Upload className="h-3.5 w-3.5" />
          Select/Upload MP3
        </Button>
      )}

      <MediaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTab="audio"
        selectedUrl={audioUrl}
        onSelect={(url) => onChange(url || null)}
      />
    </div>
  );
}
