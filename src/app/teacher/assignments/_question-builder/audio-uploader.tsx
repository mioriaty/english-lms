"use client";

import { useRef, useState } from "react";
import { Music, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { FormLabel } from "@/libs/components/ui/form";

interface AudioUploaderProps {
  audioUrl: string | null;
  onChange: (url: string | null) => void;
}

async function uploadAudio(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Upload failed");
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

async function deleteAudio(url: string): Promise<void> {
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function AudioUploader({ audioUrl, onChange }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";

    setError(null);
    setUploading(true);
    try {
      if (audioUrl) await deleteAudio(audioUrl);
      const url = await uploadAudio(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (audioUrl) await deleteAudio(audioUrl);
    onChange(null);
    setError(null);
  }

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
            onClick={handleRemove}
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
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Đang upload…" : "Upload MP3"}
        </Button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".mp3,audio/mpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
