import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  arrangement: z.enum(["REMOTE", "HYBRID", "ON_SITE", "UNSPECIFIED"]).optional(),
  seniority: z.string().trim().max(60).optional(),
  company: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "oldest", "title"]).default("newest")
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { q, location, arrangement, seniority, company, page, limit, sort } = parsed.data;
  const where = {
    status: "PUBLISHED" as const,
    AND: [
      ...(q ? [{ OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { company: { name: { contains: q, mode: "insensitive" as const } } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" as const } } } } }
      ] }] : []),
      ...(location ? [{ OR: [
        { location: { contains: location, mode: "insensitive" as const } },
        { locations: { has: location } }
      ] }] : []),
      ...(arrangement ? [{ arrangement }] : []),
      ...(seniority ? [{ seniority: { equals: seniority, mode: "insensitive" as const } }] : []),
      ...(company ? [{ company: { name: { contains: company, mode: "insensitive" as const } } }] : [])
    ]
  };
  try {
    const [total, jobs] = await db.$transaction([
      db.job.count({ where }),
      db.job.findMany({
        where,
        include: { company: { select: { name: true, slug: true, logoUrl: true, industry: true, stage: true } }, tags: { include: { tag: true } } },
        orderBy: sort === "title" ? { title: "asc" } : { postedAt: sort === "oldest" ? "asc" : "desc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);
    return NextResponse.json({ data: jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" }
    });
  } catch {
    return NextResponse.json({ error: "Job search is temporarily unavailable" }, { status: 503 });
  }
}