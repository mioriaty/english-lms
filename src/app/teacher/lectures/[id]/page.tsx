import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Download, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/libs/utils/db";
import { RichTextContent } from "@/libs/components/rich-text-content";
import { Button } from "@/libs/components/ui/button";
import { getLectureCommentsUseCase } from "@/core/lecture-comments/factories/lecture-comment.factory";
import { LectureCommentsSection } from "@/containers/lecture-comments/components/lecture-comments-section";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherLectureViewPage({ params }: Props) {
  const { id } = await params;

  const [lecture, session] = await Promise.all([
    prisma.lecture.findUnique({ where: { id } }),
    auth(),
  ]);

  if (!lecture) notFound();
  if (!session?.user?.id) notFound();

  const comments = await getLectureCommentsUseCase.execute(id);

  return (
    <div className="space-y-6">
      {/* Nav row */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/teacher/lectures">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Lectures
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/teacher/lectures/${id}/edit`}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit Lecture
          </Link>
        </Button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">{lecture.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {new Date(lecture.createdAt).toLocaleDateString("en-US")}
          {!lecture.isPublished && (
            <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Draft
            </span>
          )}
        </p>
      </div>

      <RichTextContent html={lecture.content} />

      {lecture.pdfUrl && (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-zinc-500" />
              Attached document
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={lecture.pdfUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </Button>
          </div>
          <iframe
            src={lecture.pdfUrl}
            className="h-150 w-full rounded-md border border-zinc-200 dark:border-zinc-700"
            title="Lecture PDF"
          />
        </div>
      )}

      {/* Comment section — teacher can see all comments and reply */}
      <LectureCommentsSection
        lectureId={id}
        initialComments={comments}
        currentUserId={session.user.id}
        currentUsername={session.user.name ?? "Teacher"}
        isAdmin={session.user.isAdmin ?? true}
      />
    </div>
  );
}
