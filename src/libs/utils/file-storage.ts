import fs from "fs/promises";
import path from "path";
import type { Question } from "@/core/lms/domain/question.types";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads");
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL ?? "/uploads";

async function saveFile(file: File, subDir: string, fallbackExt: string): Promise<string> {
  const ext = path.extname(file.name).toLowerCase() || fallbackExt;
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, subDir);

  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return `${UPLOAD_BASE_URL}/${subDir}/${filename}`;
}

async function deleteFile(url: string, subDir: string): Promise<void> {
  try {
    const segment = `/${subDir}/`;
    if (!url.includes(segment)) return;
    const filename = url.split(segment).at(-1);
    if (!filename) return;
    await fs.unlink(path.join(UPLOAD_DIR, subDir, filename));
  } catch {
    // File không tồn tại hoặc đã bị xóa — bỏ qua
  }
}

export function saveAudioFile(file: File): Promise<string> {
  return saveFile(file, "audio", ".mp3");
}

export function deleteAudioFile(url: string): Promise<void> {
  return deleteFile(url, "audio");
}

export function saveImageFile(file: File): Promise<string> {
  return saveFile(file, "images", ".jpg");
}

export function deleteImageFile(url: string): Promise<void> {
  return deleteFile(url, "images");
}

export function extractAudioUrls(questions: Question[]): string[] {
  return questions.flatMap((q) => (q.question.audio ? [q.question.audio] : []));
}
