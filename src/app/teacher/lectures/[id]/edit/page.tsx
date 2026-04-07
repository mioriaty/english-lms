import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/libs/utils/db";
import { EditLectureForm } from "./edit-lecture-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLecturePage({ params }: Props) {
  const { id } = await params;
  const lecture = await prisma.lecture.findUnique({ where: { id } });
  if (!lecture) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/lectures"
          className="mb-2 inline-flex items-center gap-1 text-xl text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lectures
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Edit Lecture</h1>
        <p className="text-xl text-muted-foreground">{lecture.title}</p>
      </div>
      <EditLectureForm
        lectureId={lecture.id}
        initialTitle={lecture.title}
        initialContent={lecture.content}
        initialIsPublished={lecture.isPublished}
      />
    </div>
  );
}
