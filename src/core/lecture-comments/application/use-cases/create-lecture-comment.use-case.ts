import type { ILectureCommentRepository } from "../../domain/repositories/lecture-comment.repository";
import type {
  CreateCommentInput,
  LectureComment,
} from "../../domain/entities/lecture-comment.entity";

/**
 * CreateLectureCommentUseCase
 * Creates a new comment or a reply (when parentId is provided).
 */
export class CreateLectureCommentUseCase {
  constructor(private readonly repo: ILectureCommentRepository) {}

  execute(data: CreateCommentInput): Promise<LectureComment> {
    return this.repo.createComment(data);
  }
}
