import type { ILectureCommentRepository } from "../../domain/repositories/lecture-comment.repository";

/**
 * DeleteLectureCommentUseCase
 * Deletes a comment by id. Authorization is handled in the server action layer.
 */
export class DeleteLectureCommentUseCase {
  constructor(private readonly repo: ILectureCommentRepository) {}

  execute(commentId: string): Promise<void> {
    return this.repo.deleteComment(commentId);
  }
}
