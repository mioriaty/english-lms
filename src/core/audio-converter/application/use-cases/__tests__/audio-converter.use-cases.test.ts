import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateConversionJobUseCase } from "../create-conversion-job.use-case";
import { GetConversionStatusUseCase } from "../get-conversion-status.use-case";
import { ListConversionJobsUseCase } from "../list-conversion-jobs.use-case";
import type {
  ConversionJob,
  IAudioConverterRepository,
} from "../../../domain/repositories/audio-converter.repository";

// ─── Mock Repository ──────────────────────────────────────────────────────────

function makeJob(overrides: Partial<ConversionJob> = {}): ConversionJob {
  return {
    jobId: "job-1",
    status: "pending",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeRepo(): IAudioConverterRepository {
  return {
    createJob: vi.fn(),
    getJob: vi.fn(),
    listJobs: vi.fn(),
    deleteJob: vi.fn(),
  };
}

// ─── CreateConversionJobUseCase ───────────────────────────────────────────────

describe("CreateConversionJobUseCase", () => {
  let repo: IAudioConverterRepository;
  let useCase: CreateConversionJobUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new CreateConversionJobUseCase(repo);
  });

  it("calls repository.createJob when sourceUrl is provided", async () => {
    // Arrange
    const job = makeJob();
    vi.mocked(repo.createJob).mockResolvedValue(job);
    const input = { sourceUrl: "https://example.com/audio.m3u8" };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(repo.createJob).toHaveBeenCalledOnce();
    expect(repo.createJob).toHaveBeenCalledWith(input);
    expect(result).toEqual(job);
  });

  it("calls repository.createJob when sourceFilePath is provided", async () => {
    // Arrange
    const job = makeJob({ jobId: "job-2", status: "pending" });
    vi.mocked(repo.createJob).mockResolvedValue(job);
    const input = { sourceFilePath: "/tmp/audio.mp4" };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(repo.createJob).toHaveBeenCalledWith(input);
    expect(result.jobId).toBe("job-2");
  });

  it("throws when neither sourceUrl nor sourceFilePath is provided", async () => {
    // Act & Assert
    expect(() => useCase.execute({})).toThrow(
      "Either sourceUrl or sourceFilePath is required"
    );
    expect(repo.createJob).not.toHaveBeenCalled();
  });

  it("passes httpHeaders to repository", async () => {
    // Arrange
    const job = makeJob();
    vi.mocked(repo.createJob).mockResolvedValue(job);
    const input = {
      sourceUrl: "https://example.com/protected.m3u8",
      httpHeaders: { Referer: "https://example.com" },
    };

    // Act
    await useCase.execute(input);

    // Assert
    expect(repo.createJob).toHaveBeenCalledWith(input);
  });

  it("passes originalName to repository", async () => {
    // Arrange
    const job = makeJob();
    vi.mocked(repo.createJob).mockResolvedValue(job);
    const input = {
      sourceUrl: "https://example.com/audio.m3u8",
      originalName: "lecture-01.mp3",
    };

    // Act
    await useCase.execute(input);

    // Assert
    expect(repo.createJob).toHaveBeenCalledWith(
      expect.objectContaining({ originalName: "lecture-01.mp3" })
    );
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.createJob).mockRejectedValue(new Error("DB error"));
    const input = { sourceUrl: "https://example.com/audio.m3u8" };

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow("DB error");
  });
});

// ─── GetConversionStatusUseCase ───────────────────────────────────────────────

describe("GetConversionStatusUseCase", () => {
  let repo: IAudioConverterRepository;
  let useCase: GetConversionStatusUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new GetConversionStatusUseCase(repo);
  });

  it("returns job when found", async () => {
    // Arrange
    const job = makeJob({ jobId: "job-1", status: "completed" });
    vi.mocked(repo.getJob).mockResolvedValue(job);

    // Act
    const result = await useCase.execute("job-1");

    // Assert
    expect(repo.getJob).toHaveBeenCalledWith("job-1");
    expect(result).toEqual(job);
    expect(result?.status).toBe("completed");
  });

  it("returns null when job is not found", async () => {
    // Arrange
    vi.mocked(repo.getJob).mockResolvedValue(null);

    // Act
    const result = await useCase.execute("non-existent");

    // Assert
    expect(result).toBeNull();
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.getJob).mockRejectedValue(new Error("Not found"));

    // Act & Assert
    await expect(useCase.execute("job-1")).rejects.toThrow("Not found");
  });
});

// ─── ListConversionJobsUseCase ────────────────────────────────────────────────

describe("ListConversionJobsUseCase", () => {
  let repo: IAudioConverterRepository;
  let useCase: ListConversionJobsUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new ListConversionJobsUseCase(repo);
  });

  it("returns all jobs from repository", async () => {
    // Arrange
    const jobs = [
      makeJob({ jobId: "job-1", status: "pending" }),
      makeJob({ jobId: "job-2", status: "completed" }),
      makeJob({ jobId: "job-3", status: "failed" }),
    ];
    vi.mocked(repo.listJobs).mockResolvedValue(jobs);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(repo.listJobs).toHaveBeenCalledOnce();
    expect(result).toHaveLength(3);
    expect(result[0].jobId).toBe("job-1");
    expect(result[2].status).toBe("failed");
  });

  it("returns empty array when no jobs exist", async () => {
    // Arrange
    vi.mocked(repo.listJobs).mockResolvedValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
  });

  it("propagates repository errors", async () => {
    // Arrange
    vi.mocked(repo.listJobs).mockRejectedValue(new Error("Connection refused"));

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow("Connection refused");
  });
});
