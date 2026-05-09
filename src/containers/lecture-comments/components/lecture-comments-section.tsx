"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { MessageSquare, Reply, Trash2, Send, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/libs/components/ui/button";
import { Textarea } from "@/libs/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/libs/components/ui/avatar";
import { Badge } from "@/libs/components/ui/badge";
import { Separator } from "@/libs/components/ui/separator";
import { cn } from "@/libs/utils/string";
import {
  createLectureComment,
  deleteLectureComment,
} from "@/app/actions/lecture-actions";
import type {
  CommentWithAuthor,
  ReplyWithAuthor,
} from "@/core/lecture-comments/domain/entities/lecture-comment.entity";

interface Props {
  lectureId: string;
  initialComments: CommentWithAuthor[];
  currentUserId: string;
  currentUsername: string;
  isAdmin: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/**
 * Renders comment content with @mentions highlighted in blue.
 */
function CommentContent({ text }: { text: string }) {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return (
    <span className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span
            key={i}
            className="font-medium text-blue-600 dark:text-blue-400"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

// ── Comment Form ───────────────────────────────────────────────────────────────

interface CommentFormProps {
  lectureId: string;
  parentId?: string | null;
  placeholder?: string;
  defaultValue?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

function CommentForm({
  lectureId,
  parentId,
  placeholder = "Write a comment…",
  defaultValue = "",
  onSuccess,
  onCancel,
  autoFocus,
  compact,
}: CommentFormProps) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(async () => {
      try {
        await createLectureComment(lectureId, value, parentId);
        setValue("");
        toast.success(parentId ? "Reply sent!" : "Comment posted!");
        onSuccess?.();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        disabled={isPending}
        className="resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (value.trim()) handleSubmit(e as unknown as React.FormEvent);
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Ctrl+Enter to send</p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending || !value.trim()}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? "Sending…" : parentId ? "Send reply" : "Post comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ── Reply Card ─────────────────────────────────────────────────────────────────

interface ReplyCardProps {
  reply: ReplyWithAuthor;
  lectureId: string;
  currentUserId: string;
  isAdmin: boolean;
}

function ReplyCard({
  reply,
  lectureId,
  currentUserId,
  isAdmin,
}: ReplyCardProps) {
  const [isPending, startTransition] = useTransition();
  const canDelete = isAdmin || reply.authorId === currentUserId;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteLectureComment(reply.id, lectureId);
        toast.success("Reply deleted");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    });
  };

  return (
    <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback className="text-[10px]">
          {getInitials(reply.author.username)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold">{reply.author.username}</span>
          {reply.author.isAdmin && (
            <Badge variant="secondary" className="h-4 gap-0.5 px-1 text-[10px]">
              <Shield className="h-2.5 w-2.5" />
              Teacher
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground">
            {formatDate(reply.createdAt)}
          </span>
        </div>
        <div className="mt-1">
          <CommentContent text={reply.content} />
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title="Delete"
          className="ml-auto self-start rounded p-1 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Top-Level Comment Card ─────────────────────────────────────────────────────

interface CommentCardProps {
  comment: CommentWithAuthor;
  lectureId: string;
  currentUserId: string;
  currentUsername: string;
  isAdmin: boolean;
}

function CommentCard({
  comment,
  lectureId,
  currentUserId,
  currentUsername,
  isAdmin,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canDelete = isAdmin || comment.authorId === currentUserId;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteLectureComment(comment.id, lectureId);
        toast.success("Comment deleted");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    });
  };

  const replyPrefix = `@${comment.author.username} `;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Author row */}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-sm font-medium">
            {getInitials(comment.author.username)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {comment.author.username}
            </span>
            {comment.author.isAdmin && (
              <Badge
                variant="secondary"
                className="h-4 gap-0.5 px-1.5 text-[10px]"
              >
                <Shield className="h-2.5 w-2.5" />
                Teacher
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <div className="mt-1.5">
            <CommentContent text={comment.content} />
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplyForm((v) => !v)}
            >
              <Reply className="h-3.5 w-3.5" />
              {showReplyForm
                ? "Cancel"
                : `Reply${comment.replies.length > 0 ? ` (${comment.replies.length})` : ""}`}
            </Button>
          </div>
        </div>

        {/* Delete button */}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            title="Delete comment"
            className="shrink-0 self-start rounded p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Replies list */}
      {comment.replies.length > 0 && (
        <div className="ml-12 mt-3 flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              lectureId={lectureId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-12 mt-3">
          <CommentForm
            lectureId={lectureId}
            parentId={comment.id}
            placeholder={`Reply to @${comment.author.username}…`}
            defaultValue={replyPrefix}
            autoFocus
            compact
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────────────────────

export function LectureCommentsSection({
  lectureId,
  initialComments,
  currentUserId,
  currentUsername,
  isAdmin,
}: Props) {
  return (
    <section className="space-y-6">
      <Separator />

      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold">
          Discussion
          {initialComments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({initialComments.length}{" "}
              {initialComments.length === 1 ? "comment" : "comments"})
            </span>
          )}
        </h2>
      </div>

      {/* New comment form */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Commenting as{" "}
          <span className="font-semibold text-foreground">
            @{currentUsername}
          </span>
          {isAdmin && (
            <Badge
              variant="secondary"
              className="ml-1.5 h-4 gap-0.5 px-1.5 text-[10px]"
            >
              <Shield className="h-2.5 w-2.5" />
              Teacher
            </Badge>
          )}
        </p>
        <CommentForm
          lectureId={lectureId}
          placeholder="Ask a question or share your thoughts… (use @name to mention someone)"
        />
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {initialComments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          initialComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              lectureId={lectureId}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </section>
  );
}
