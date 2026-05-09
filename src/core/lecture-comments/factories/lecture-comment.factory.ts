import { LectureCommentRepositoryImpl } from "@/containers/lecture-comments/infrastructure/repositories/lecture-comment.repository.impl";
import { GetLectureCommentsUseCase } from "../application/use-cases/get-lecture-comments.use-case";
import { CreateLectureCommentUseCase } from "../application/use-cases/create-lecture-comment.use-case";
import { DeleteLectureCommentUseCase } from "../application/use-cases/delete-lecture-comment.use-case";

const lectureCommentRepository = new LectureCommentRepositoryImpl();

export const getLectureCommentsUseCase = new GetLectureCommentsUseCase(
  lectureCommentRepository
);
export const createLectureCommentUseCase = new CreateLectureCommentUseCase(
  lectureCommentRepository
);
export const deleteLectureCommentUseCase = new DeleteLectureCommentUseCase(
  lectureCommentRepository
);

// Also export repository directly for the server action auth check (findById)
export const lectureCommentRepo = lectureCommentRepository;
