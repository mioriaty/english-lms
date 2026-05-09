import type {
  CommentWithAuthor,
  CreateCommentInput,
  LectureComment,
} from "../entities/lecture-comment.entity";

export interface ILectureCommentRepository {
  getCommentsByLecture(lectureId: string): Promise<CommentWithAuthor[]>;
  createComment(data: CreateCommentInput): Promise<LectureComment>;
  deleteComment(commentId: string): Promise<void>;
  findById(commentId: string): Promise<LectureComment | null>;
}
