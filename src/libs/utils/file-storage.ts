import fs from "fs/promises";
import path from "path";
import type { Question } from "@/core/lms/domain/question.types";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads");
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL ?? "/uploads";

async function saveFile(file: File, subDir: string, fallbackExt: string): Promise<string> {
  const ext = path.extname(file.name).toLowerCase() || fallbackExt;
  const rawBasename = path.basename(file.name, ext);
  // Remove non-alphanumeric chars to prevent issues, taking up to 50 chars
  const safeBasename = rawBasename.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 50);
  
  const filename = `${crypto.randomUUID()}_${safeBasename}${ext}`;
  const dir = path.join(UPLOAD_DIR, subDir);

  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return `${UPLOAD_BASE_URL}/${subDir}/${filename}`;
}

async function getFilesList(subDir: "audio" | "images"): Promise<{ url: string; name: string }[]> {
  try {
    const dir = path.join(UPLOAD_DIR, subDir);
    const files = await fs.readdir(dir);
    return files.map((filename) => {
      let displayName = filename;
      const underscoreIdx = filename.indexOf("_");
      // Check if it matches UUID-like format before underscore
      if (underscoreIdx > 8) { 
        displayName = filename.substring(underscoreIdx + 1);
      }
      
      return {
        url: `${UPLOAD_BASE_URL}/${subDir}/${filename}`,
        name: displayName,
      };
    });
  } catch {
    // Return empty array if directory doesn't exist
    return [];
  }
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

export function getAudioFiles() {
  return getFilesList("audio");
}

export function getImageFiles() {
  return getFilesList("images");
}
