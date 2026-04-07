import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveAudioFile, deleteAudioFile } from "@/libs/utils/file-storage";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

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
  if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
    return NextResponse.json({ error: "Chỉ chấp nhận file MP3" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File vượt quá giới hạn 20MB" }, { status: 400 });
  }

  const url = await saveAudioFile(file);
  return NextResponse.json({ url });
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { url } = await req.json() as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "Thiếu url" }, { status: 400 });
  }

  await deleteAudioFile(url);
  return NextResponse.json({ ok: true });
}
