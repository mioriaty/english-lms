import { notFound } from "next/navigation";
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
        <h1 className="text-2xl font-bold tracking-tight">Edit Lecture</h1>
        <p className="text-sm text-muted-foreground">{lecture.title}</p>
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
