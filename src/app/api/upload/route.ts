import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  saveAudioFile,
  deleteAudioFile,
  saveImageFile,
  deleteImageFile,
  getAudioFiles,
  getImageFiles,
} from "@/libs/utils/file-storage";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    let files: { url: string; name: string; type: "image" | "audio" }[] = [];

    if (!type || type === "image") {
      const imageFiles = await getImageFiles();
      files.push(...imageFiles.map(f => ({ ...f, type: "image" as const })));
    }

    if (!type || type === "audio") {
      const audioFiles = await getAudioFiles();
      files.push(...audioFiles.map(f => ({ ...f, type: "audio" as const })));
    }

    // Sort files by newest first (optional, maybe we can't easily without stat, but let's just reverse for now assuming names contain timestamp/uuid)
    files.reverse();

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds 5MB limit" },
        { status: 400 }
      );
    }
    const url = await saveImageFile(file);
    return NextResponse.json({ url });
  }

  if (file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3")) {
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 20MB limit" },
        { status: 400 }
      );
    }
    const url = await saveAudioFile(file);
    return NextResponse.json({ url });
  }

  return NextResponse.json(
    { error: "Unsupported file format" },
    { status: 400 }
  );
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { url } = (await req.json()) as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  await deleteAudioFile(url);
  await deleteImageFile(url);
  return NextResponse.json({ ok: true });
}
