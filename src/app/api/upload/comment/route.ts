import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  saveAudioFile,
  saveImageFile,
  savePdfFile,
} from "@/libs/utils/file-storage";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    if (ALLOWED_IMAGE_TYPES.has(file.type)) {
      const url = await saveImageFile(file);
      return NextResponse.json({ url });
    }

    if (file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3")) {
      const url = await saveAudioFile(file);
      return NextResponse.json({ url });
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const url = await savePdfFile(file);
      return NextResponse.json({ url });
    }

    return NextResponse.json(
      { error: "Unsupported file format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
