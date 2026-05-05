"use client";

import { Button } from "@/libs/components/ui/button";
import { Label } from "@/libs/components/ui/label";
import { FileText, X } from "lucide-react";
import { useState } from "react";
import { MediaModal } from "@/app/teacher/assignments/_components/media-modal";

interface PdfUploaderProps {
  pdfUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function PdfUploader({
  pdfUrl,
  onChange,
  label = "Lecture PDF",
}: PdfUploaderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Extract a friendly filename from the URL
  const filename = pdfUrl
    ? decodeURIComponent(pdfUrl.split("/").pop() ?? pdfUrl)
    : null;

  return (
    <div className="space-y-1.5">
      <Label>
        {label}{" "}
        <span className="font-normal text-zinc-400">(PDF, maximum 20MB, optional)</span>
      </Label>

      {pdfUrl ? (
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {filename}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-zinc-500 hover:text-red-500"
            aria-label="Remove PDF"
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
          <FileText className="h-3.5 w-3.5" />
          Select/Upload PDF
        </Button>
      )}

      <MediaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTab="pdf"
        selectedUrl={pdfUrl}
        onSelect={(url) => onChange(url || null)}
      />
    </div>
  );
}
