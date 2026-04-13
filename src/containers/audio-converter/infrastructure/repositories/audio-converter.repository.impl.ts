import ffmpeg from "fluent-ffmpeg";
import { execSync } from "node:child_process";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import fs from "node:fs";
import type {
  ConversionJob,
  CreateJobInput,
  IAudioConverterRepository,
} from "@/core/audio-converter/domain/repositories/audio-converter.repository";

// Resolve ffmpeg binary: prefer system ffmpeg (brew/apt), fallback to ffmpeg-static
function resolveFFmpegPath(): string | null {
  try {
    const systemPath = execSync("which ffmpeg", { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
    if (systemPath) return systemPath;
  } catch {
    // system ffmpeg not found, try ffmpeg-static
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic: string | null = require("ffmpeg-static");
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic;
  } catch {
    // ffmpeg-static not available
  }
  return null;
}

const ffmpegBin = resolveFFmpegPath();
if (ffmpegBin) {
  ffmpeg.setFfmpegPath(ffmpegBin);
}

// In-memory job store (sufficient for admin tool)
const jobStore = new Map<string, ConversionJob>();

const OUTPUT_DIR = path.join(process.cwd(), "public", "converted");

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

export class AudioConverterRepositoryImpl implements IAudioConverterRepository {
  async createJob(input: CreateJobInput): Promise<ConversionJob> {
    ensureOutputDir();

    const jobId = uuidv4();
    const outputFilename = `${jobId}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    const job: ConversionJob = {
      jobId,
      status: "pending",
      outputFilename,
      progress: 0,
      createdAt: new Date(),
    };

    jobStore.set(jobId, job);

    // Run conversion asynchronously
    this.runConversion(jobId, input, outputPath);

    return job;
  }

  async getJob(jobId: string): Promise<ConversionJob | null> {
    return jobStore.get(jobId) ?? null;
  }

  async listJobs(): Promise<ConversionJob[]> {
    return Array.from(jobStore.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteJob(jobId: string): Promise<void> {
    const job = jobStore.get(jobId);
    if (job?.outputFilename) {
      const filePath = path.join(OUTPUT_DIR, job.outputFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    jobStore.delete(jobId);
  }

  private runConversion(
    jobId: string,
    input: CreateJobInput,
    outputPath: string
  ) {
    const source = input.sourceUrl ?? input.sourceFilePath;
    if (!source) return;

    // Update status to processing
    const job = jobStore.get(jobId);
    if (job) {
      jobStore.set(jobId, { ...job, status: "processing" });
    }

    // Build HTTP headers string for ffmpeg (format: "Key: Value\r\nKey2: Value2\r\n")
    const mergedHeaders = { ...input.httpHeaders };
    const headersString = Object.keys(mergedHeaders).length > 0 
      ? Object.entries(mergedHeaders).map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n"
      : "";

    const inputOptions = [
      "-user_agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "-protocol_whitelist", "file,http,https,tcp,tls,crypto",
    ];

    if (headersString) {
      inputOptions.push("-headers", headersString);
    }

    let commandString = "";

    ffmpeg(source)
      .inputOptions(inputOptions)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .toFormat("mp3")
      .on("start", (cmd) => {
        commandString = cmd;
        console.log(`[AudioConverter] Spawning FFmpeg: ${cmd}`);
      })
      .on("progress", (progress) => {
        const current = jobStore.get(jobId);
        if (current) {
          jobStore.set(jobId, {
            ...current,
            progress: Math.round(progress.percent ?? 0),
          });
        }
      })
      .on("end", () => {
        console.log(`[AudioConverter] Job ${jobId} completed`);
        const current = jobStore.get(jobId);
        if (current) {
          jobStore.set(jobId, {
            ...current,
            status: "completed",
            progress: 100,
            completedAt: new Date(),
          });
        }
      })
      .on("error", (err) => {
        console.error(`[AudioConverter] Job ${jobId} failed: ${err.message}`);
        const current = jobStore.get(jobId);
        if (current) {
          jobStore.set(jobId, {
            ...current,
            status: "failed",
            error: `${err.message}`, // Can add commandString here if needed later
          });
        }
      })
      .save(outputPath);
  }
}
