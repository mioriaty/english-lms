import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "node:fs";
import path from "node:path";
import { getConversionStatusUseCase } from "@/core/audio-converter/factories/audio-converter.factory";
import { Readable } from "node:stream";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getConversionStatusUseCase.execute(jobId);

  if (!job || !job.outputFilename || job.status !== "completed") {
    return NextResponse.json({ error: "File not ready or job not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "converted", job.outputFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  try {
    const stat = fs.statSync(filePath);
    
    // Convert Node stream to Web stream for NextResponse
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `attachment; filename="${job.outputFilename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Error reading file:", err);
    return NextResponse.json({ error: "Error reading file" }, { status: 500 });
  }
}
