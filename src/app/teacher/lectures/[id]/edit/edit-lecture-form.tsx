"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateLecture } from "@/app/actions/lecture-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Switch } from "@/libs/components/ui/switch";
import { RichTextEditor } from "@/libs/components/rich-text-editor";
import { PdfUploader } from "@/app/teacher/lectures/_components/pdf-uploader";

interface EditLectureFormProps {
  lectureId: string;
  initialTitle: string;
  initialContent: string;
  initialIsPublished: boolean;
  initialPdfUrl: string | null;
}

export function EditLectureForm({
  lectureId,
  initialTitle,
  initialContent,
  initialIsPublished,
  initialPdfUrl,
}: EditLectureFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setPending(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content);
      fd.append("isPublished", String(isPublished));
      if (pdfUrl) fd.append("pdfUrl", pdfUrl);
      await updateLecture(lectureId, fd);
      toast.success("Changes saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <PdfUploader pdfUrl={pdfUrl} onChange={setPdfUrl} />

      <div className="flex items-center gap-3">
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          Published
        </Label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
