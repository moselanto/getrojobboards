import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id || id.length > 180) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  try {
    const job = await db.job.findFirst({ where: { status: "PUBLISHED", OR: [{ id }, { slug: id }] }, include: { company: true, tags: { include: { tag: true } } } });
    if (!job || (job.expiresAt && job.expiresAt.getTime() < Date.now())) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json({ data: job }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch {
    return NextResponse.json({ error: "Job details are temporarily unavailable" }, { status: 503 });
  }
}
