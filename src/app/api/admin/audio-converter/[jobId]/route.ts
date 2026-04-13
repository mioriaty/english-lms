import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getConversionStatusUseCase,
  audioConverterRepository,
} from "@/core/audio-converter/factories/audio-converter.factory";

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

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getConversionStatusUseCase.execute(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await audioConverterRepository.deleteJob(jobId);
  return NextResponse.json({ success: true });
}
