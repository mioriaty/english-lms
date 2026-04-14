"use client";

import { Button } from "@/libs/components/ui/button";
import { FormLabel } from "@/libs/components/ui/form";
import { ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { MediaModal } from "./media-modal";

interface ImageUploaderProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUploader({
  imageUrl,
  onChange,
  label = "Assignment's image",
}: ImageUploaderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <FormLabel>
        {label}{" "}
        <span className="font-normal text-zinc-400">
          (JPG, PNG, WebP, maximum 5MB, optional)
        </span>
      </FormLabel>

      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Assignment cover"
            className="h-40 w-auto rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
            aria-label="Remove image"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
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
          <ImageIcon className="h-3.5 w-3.5" />
          Select/Upload image
        </Button>
      )}

      <MediaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTab="image"
        selectedUrl={imageUrl}
        onSelect={(url) => onChange(url || null)}
      />
    </div>
  );
}
