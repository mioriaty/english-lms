import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  saveAudioFile,
  deleteAudioFile,
  saveImageFile,
  deleteImageFile,
} from "@/libs/utils/file-storage";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File không hợp lệ" }, { status: 400 });
  }

  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Ảnh vượt quá giới hạn 5MB" }, { status: 400 });
    }
    const url = await saveImageFile(file);
    return NextResponse.json({ url });
  }

  if (file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3")) {
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "File vượt quá giới hạn 20MB" }, { status: 400 });
    }
    const url = await saveAudioFile(file);
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Định dạng file không được hỗ trợ" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { url } = await req.json() as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "Thiếu url" }, { status: 400 });
  }

  await deleteAudioFile(url);
  await deleteImageFile(url);
  return NextResponse.json({ ok: true });
}
