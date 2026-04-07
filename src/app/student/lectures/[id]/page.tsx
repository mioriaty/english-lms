import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
        <h1 className="text-2xl font-bold tracking-tight">{lecture.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {new Date(lecture.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      <RichTextContent html={lecture.content} />
    </div>
  );
}
