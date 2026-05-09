import type { ILectureCommentRepository } from "../../domain/repositories/lecture-comment.repository";
import type { CommentWithAuthor } from "../../domain/entities/lecture-comment.entity";

/**
 * GetLectureCommentsUseCase
 * Fetches all top-level comments (with replies nested) for a given lecture.
 */
export class GetLectureCommentsUseCase {
  constructor(private readonly repo: ILectureCommentRepository) {}

  execute(lectureId: string): Promise<CommentWithAuthor[]> {
    return this.repo.getCommentsByLecture(lectureId);
  }
}
