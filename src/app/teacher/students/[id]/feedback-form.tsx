"use client";

import { useState, useTransition } from "react";
import { Button } from "@/libs/components/ui/button";
import { Textarea } from "@/libs/components/ui/textarea";
import { upsertSubmissionFeedback } from "@/app/actions/submission-actions";

interface FeedbackFormProps {
  submissionId: string;
  initialFeedback: string | null;
  feedbackAt: Date | null;
}

export function FeedbackForm({
  submissionId,
  initialFeedback,
  feedbackAt,
}: FeedbackFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialFeedback ?? "");
  const [saved, setSaved] = useState(initialFeedback);
  const [savedAt, setSavedAt] = useState(feedbackAt);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await upsertSubmissionFeedback(submissionId, value);
      setSaved(value.trim() || null);
      setSavedAt(value.trim() ? new Date() : null);
      setIsEditing(false);
    });
  }

  function handleCancel() {
    setValue(saved ?? "");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="mt-4 space-y-2 border-t pt-4">
        <p className="text-xs font-medium text-zinc-500">Teacher Feedback</p>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write feedback for this submission…"
          className="min-h-[80px] text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      {saved ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Teacher Feedback</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-zinc-400 underline hover:text-zinc-600"
            >
              Edit
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {saved}
          </p>
          {savedAt && (
            <p className="text-xs text-zinc-400">
              {new Date(savedAt).toLocaleString("en-US")}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-zinc-400 underline hover:text-zinc-600"
        >
          + Add feedback
        </button>
      )}
    </div>
  );
}
