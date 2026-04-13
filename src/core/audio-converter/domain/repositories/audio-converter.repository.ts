export type ConversionStatus = "pending" | "processing" | "completed" | "failed";

export interface ConversionJob {
  jobId: string;
  status: ConversionStatus;
  outputFilename?: string;
  progress?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateJobInput {
  sourceUrl?: string;
  sourceFilePath?: string;
  originalName?: string;
  /** Custom HTTP headers for authenticated/protected streams e.g. { Referer: 'https://...' } */
  httpHeaders?: Record<string, string>;
}

export interface IAudioConverterRepository {
  createJob(input: CreateJobInput): Promise<ConversionJob>;
  getJob(jobId: string): Promise<ConversionJob | null>;
  listJobs(): Promise<ConversionJob[]>;
  deleteJob(jobId: string): Promise<void>;
}
