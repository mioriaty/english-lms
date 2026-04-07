import fs from "fs/promises";
import path from "path";
import type { Question } from "@/core/lms/domain/question.types";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads");
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL ?? "/uploads";

export async function saveAudioFile(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase() || ".mp3";
  const filename = `${crypto.randomUUID()}${ext}`;
  const audioDir = path.join(UPLOAD_DIR, "audio");

  await fs.mkdir(audioDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(audioDir, filename), buffer);

  return `${UPLOAD_BASE_URL}/audio/${filename}`;
}

export async function deleteAudioFile(url: string): Promise<void> {
  try {
    const baseUrl = UPLOAD_BASE_URL.endsWith("/") ? UPLOAD_BASE_URL.slice(0, -1) : UPLOAD_BASE_URL;
    if (!url.includes("/audio/")) return;

    const filename = url.split("/audio/").at(-1);
    if (!filename) return;

    const filePath = path.join(UPLOAD_DIR, "audio", filename);
    await fs.unlink(filePath);
  } catch {
    // File không tồn tại hoặc đã bị xóa — bỏ qua
  }
}

export function extractAudioUrls(questions: Question[]): string[] {
  return questions.flatMap((q) => (q.question.audio ? [q.question.audio] : []));
}
