"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLecture } from "@/app/actions/lecture-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { Switch } from "@/libs/components/ui/switch";
import { RichTextEditor } from "@/libs/components/rich-text-editor";

export function NewLectureForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
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
      const res = await createLecture(fd);
      if (res?.ok) router.push(`/teacher/lectures/${res.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo thất bại.");
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
          placeholder="Exp: Unit 1 — Vocabulary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Enter lecture content…"
        />
      </div>

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
        {pending ? "Creating…" : "Create Lecture"}
      </Button>
    </form>
  );
}
