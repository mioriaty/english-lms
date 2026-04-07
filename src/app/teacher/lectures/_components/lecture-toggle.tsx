"use client";

import { useTransition } from "react";
import { setLecturePublished } from "@/app/actions/lecture-actions";
import { Button } from "@/libs/components/ui/button";

export function LectureToggle({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => setLecturePublished(id, !isPublished))}
    >
      {pending ? "…" : isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}
