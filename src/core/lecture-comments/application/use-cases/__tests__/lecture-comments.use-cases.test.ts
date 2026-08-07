import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateLectureCommentUseCase } from "../create-lecture-comment.use-case";
import { DeleteLectureCommentUseCase } from "../delete-lecture-comment.use-case";
import { GetLectureCommentsUseCase } from "../get-lecture-comments.use-case";
import type {
  CommentWithAuthor,
  CreateCommentInput,
  LectureComment,
} from "../../../domain/entities/lecture-comment.entity";
import type { ILectureCommentRepository } from "../../../domain/repositories/lecture-comment.repository";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeComment(overrides: Partial<LectureComment> = {}): LectureComment {
  return {
    id: "comment-1",
    content: "Great lecture!",
    mentionedUsernames: [],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    lectureId: "lecture-1",
    authorId: "user-1",
    parentId: null,
    mediaUrl: null,
    mediaType: null,
    mediaName: null,
    ...overrides,
  };
}

function makeCommentWithAuthor(
  overrides: Partial<CommentWithAuthor> = {}
): CommentWithAuthor {
  return {
    ...makeComment(),
    author: { id: "user-1", username: "alice", isAdmin: false },
    replies: [],
    ...overrides,
  };
}

function makeRepo(): ILectureCommentRepository {
  return {
    getCommentsByLecture: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
    findById: vi.fn(),
  };
}

function makeCreateInput(
  overrides: Partial<CreateCommentInput> = {}
): CreateCommentInput {
  return {
    content: "Hello!",
    mentionedUsernames: [],
    lectureId: "lecture-1",
    authorId: "user-1",
    parentId: null,
    ...overrides,
  };
}

// ─── CreateLectureCommentUseCase ──────────────────────────────────────────────

describe("CreateLectureCommentUseCase", () => {
  let repo: ILectureCommentRepository;
  let useCase: CreateLectureCommentUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new CreateLectureCommentUseCase(repo);
  });

  it("creates a top-level comment and returns it", async () => {
    // Arrange
    const comment = makeComment({ content: "Hello!" });
    vi.mocked(repo.createComment).mockResolvedValue(comment);
    const input = makeCreateInput({ content: "Hello!" });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(repo.createComment).toHaveBeenCalledOnce();
    expect(repo.createComment).toHaveBeenCalledWith(input);
    expect(result.content).toBe("Hello!");
    expect(result.parentId).toBeNull();
  });

  it("creates a reply when parentId is provided", async () => {
    // Arrange
    const reply = makeComment({ id: "comment-2", parentId: "comment-1" });
    vi.mocked(repo.createComment).mockResolvedValue(reply);
    const input = makeCreateInput({ parentId: "comment-1" });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(repo.createComment).toHaveBeenCalledWith(input);
    expect(result.parentId).toBe("comment-1");
  });

  it("passes mentionedUsernames to repository", async () => {
    // Arrange
    const comment = makeComment({ mentionedUsernames: ["bob", "carol"] });
    vi.mocked(repo.createComment).mockResolvedValue(comment);
    const input = makeCreateInput({ mentionedUsernames: ["bob", "carol"] });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(repo.createComment).toHaveBeenCalledWith(
      expect.objectContaining({ mentionedUsernames: ["bob", "carol"] })
    );
    expect(result.mentionedUsernames).toEqual(["bob", "carol"]);
  });

  it("creates a comment with media attachment", async () => {
    // Arrange
    const comment = makeComment({
      mediaUrl: "https://storage.example.com/file.mp3",
      mediaType: "audio/mp3",
      mediaName: "note.mp3",
    });
    vi.mocked(repo.createComment).mockResolvedValue(comment);
    const input = makeCreateInput({
      mediaUrl: "https://storage.example.com/file.mp3",
      mediaType: "audio/mp3",
      mediaName: "note.mp3",
    });

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.mediaUrl).toBe("https://storage.example.com/file.mp3");
    expect(result.mediaType).toBe("audio/mp3");
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.createComment).mockRejectedValue(new Error("DB error"));

    // Act & Assert
    await expect(useCase.execute(makeCreateInput())).rejects.toThrow("DB error");
  });
});

// ─── DeleteLectureCommentUseCase ──────────────────────────────────────────────

describe("DeleteLectureCommentUseCase", () => {
  let repo: ILectureCommentRepository;
  let useCase: DeleteLectureCommentUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new DeleteLectureCommentUseCase(repo);
  });

  it("calls repository.deleteComment with the given id", async () => {
    // Arrange
    vi.mocked(repo.deleteComment).mockResolvedValue(undefined);

    // Act
    await useCase.execute("comment-1");

    // Assert
    expect(repo.deleteComment).toHaveBeenCalledOnce();
    expect(repo.deleteComment).toHaveBeenCalledWith("comment-1");
  });

  it("resolves with undefined on success", async () => {
    // Arrange
    vi.mocked(repo.deleteComment).mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute("comment-1");

    // Assert
    expect(result).toBeUndefined();
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.deleteComment).mockRejectedValue(new Error("Not found"));

    // Act & Assert
    await expect(useCase.execute("non-existent")).rejects.toThrow("Not found");
  });
});

// ─── GetLectureCommentsUseCase ────────────────────────────────────────────────

describe("GetLectureCommentsUseCase", () => {
  let repo: ILectureCommentRepository;
  let useCase: GetLectureCommentsUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new GetLectureCommentsUseCase(repo);
  });

  it("fetches comments for the given lectureId", async () => {
    // Arrange
    const comments = [makeCommentWithAuthor(), makeCommentWithAuthor({ id: "comment-2" })];
    vi.mocked(repo.getCommentsByLecture).mockResolvedValue(comments);

    // Act
    const result = await useCase.execute("lecture-1");

    // Assert
    expect(repo.getCommentsByLecture).toHaveBeenCalledWith("lecture-1");
    expect(result).toHaveLength(2);
  });

  it("returns comments with nested replies", async () => {
    // Arrange
    const reply = makeCommentWithAuthor({
      id: "reply-1",
      parentId: "comment-1",
      content: "Thanks!",
    });
    const parent = makeCommentWithAuthor({
      id: "comment-1",
      replies: [reply],
    });
    vi.mocked(repo.getCommentsByLecture).mockResolvedValue([parent]);

    // Act
    const result = await useCase.execute("lecture-1");

    // Assert
    expect(result[0].replies).toHaveLength(1);
    expect(result[0].replies[0].id).toBe("reply-1");
  });

  it("returns comments with author information", async () => {
    // Arrange
    const comment = makeCommentWithAuthor({
      author: { id: "user-42", username: "instructor", isAdmin: true },
    });
    vi.mocked(repo.getCommentsByLecture).mockResolvedValue([comment]);

    // Act
    const result = await useCase.execute("lecture-1");

    // Assert
    expect(result[0].author.username).toBe("instructor");
    expect(result[0].author.isAdmin).toBe(true);
  });

  it("returns empty array when lecture has no comments", async () => {
    // Arrange
    vi.mocked(repo.getCommentsByLecture).mockResolvedValue([]);

    // Act
    const result = await useCase.execute("lecture-empty");

    // Assert
    expect(result).toEqual([]);
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.getCommentsByLecture).mockRejectedValue(
      new Error("Lecture not found")
    );

    // Act & Assert
    await expect(useCase.execute("lecture-1")).rejects.toThrow(
      "Lecture not found"
    );
  });
});
