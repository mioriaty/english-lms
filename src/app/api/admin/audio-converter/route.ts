import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createConversionJobUseCase,
  listConversionJobsUseCase,
} from "@/core/audio-converter/factories/audio-converter.factory";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (
        !file.name.endsWith(".m3u8") &&
        !file.name.endsWith(".ts") &&
        !file.name.endsWith(".mp4") &&
        !file.name.endsWith(".avi") &&
        !file.name.endsWith(".mkv")
      ) {
        return NextResponse.json(
          { error: "Unsupported file type. Supported: .m3u8, .ts, .mp4, .avi, .mkv" },
          { status: 400 }
        );
      }

      // Save temp file
      const tmpDir = os.tmpdir();
      const tmpPath = path.join(tmpDir, `upload-${Date.now()}-${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tmpPath, buffer);

      const job = await createConversionJobUseCase.execute({
        sourceFilePath: tmpPath,
        originalName: file.name,
      });

      return NextResponse.json(job, { status: 201 });
    } else {
      // Handle URL input
      const body = await req.json();
      const { sourceUrl, referer } = body as { sourceUrl?: string; referer?: string };

      if (!sourceUrl?.trim()) {
        return NextResponse.json(
          { error: "sourceUrl is required" },
          { status: 400 }
        );
      }

      const safeSourceUrl = sourceUrl.trim();

      // Basic URL validation
      try {
        new URL(safeSourceUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }

      const httpHeaders: Record<string, string> = {};
      if (referer?.trim()) httpHeaders["Referer"] = referer.trim();

      const job = await createConversionJobUseCase.execute({ sourceUrl: safeSourceUrl, httpHeaders });
      return NextResponse.json(job, { status: 201 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await listConversionJobsUseCase.execute();
  return NextResponse.json(jobs);
}
