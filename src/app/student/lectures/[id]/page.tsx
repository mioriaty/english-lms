import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Download } from "lucide-react";
import { prisma } from "@/libs/utils/db";
import { RichTextContent } from "@/libs/components/rich-text-content";
import { Button } from "@/libs/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentLectureDetailPage({ params }: Props) {
  const { id } = await params;
  const lecture = await prisma.lecture.findUnique({
    where: { id, isPublished: true },
  });
  if (!lecture) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/student/lectures">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Lectures
        </Link>
      </Button>

      <div>
        <h1 className="text-xl font-bold tracking-tight">{lecture.title}</h1>
        <p className="mt-1 text-xl text-zinc-500">
          {new Date(lecture.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      <RichTextContent html={lecture.content} />

      {lecture.pdfUrl && (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-zinc-500" />
              Tài liệu đính kèm
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={lecture.pdfUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                Tải xuống
              </a>
            </Button>
          </div>
          <iframe
            src={lecture.pdfUrl}
            className="h-[600px] w-full rounded-md border border-zinc-200 dark:border-zinc-700"
            title="Lecture PDF"
          />
        </div>
      )}
    </div>
  );
}
