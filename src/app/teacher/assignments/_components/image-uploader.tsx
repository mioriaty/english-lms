"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/libs/components/ui/button";
import { Label } from "@/libs/components/ui/label";

interface ImageUploaderProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

async function uploadImage(file: File): Promise<string> {
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

async function deleteImage(url: string): Promise<void> {
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function ImageUploader({
  imageUrl,
  onChange,
  label = "Assignment's image",
}: ImageUploaderProps) {
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
      if (imageUrl) await deleteImage(imageUrl);
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (imageUrl) await deleteImage(imageUrl);
    onChange(null);
    setError(null);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-500">
        {label}{" "}
        <span className="text-zinc-400">
          (JPG, PNG, WebP, maximum 5MB, optional)
        </span>
      </Label>

      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Assignment cover"
            className="h-40 w-auto rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
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
            <ImageIcon className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
