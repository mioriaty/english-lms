import { prisma } from "@/libs/utils/db";
import type { ILectureCommentRepository } from "@/core/lecture-comments/domain/repositories/lecture-comment.repository";
import type {
  CommentWithAuthor,
  CreateCommentInput,
  LectureComment,
} from "@/core/lecture-comments/domain/entities/lecture-comment.entity";

const authorSelect = {
  id: true,
  username: true,
  isAdmin: true,
} as const;

/**
 * LectureCommentRepositoryImpl
 * Calls Prisma directly — no intermediary data-source layer.
 */
export class LectureCommentRepositoryImpl
  implements ILectureCommentRepository
{
  async getCommentsByLecture(lectureId: string): Promise<CommentWithAuthor[]> {
    const rows = await prisma.lectureComment.findMany({
      where: { lectureId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: authorSelect },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: authorSelect } },
        },
      },
    });

    return rows as unknown as CommentWithAuthor[];
  }

  async createComment(data: CreateCommentInput): Promise<LectureComment> {
    const comment = await prisma.lectureComment.create({
      data: {
        content: data.content,
        mentionedUsernames: data.mentionedUsernames,
        lectureId: data.lectureId,
        authorId: data.authorId,
        parentId: data.parentId ?? null,
        mediaUrl: data.mediaUrl ?? null,
        mediaType: data.mediaType ?? null,
        mediaName: data.mediaName ?? null,
      },
    });
    return comment as unknown as LectureComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    await prisma.lectureComment.delete({ where: { id: commentId } });
  }

  async findById(commentId: string): Promise<LectureComment | null> {
    const comment = await prisma.lectureComment.findUnique({
      where: { id: commentId },
    });
    return comment as unknown as LectureComment | null;
  }
}
