import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid search parameters", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { q, location, page, limit } = parsed.data;
  const where = {
    AND: [
      ...(q ? [{ OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { industry: { contains: q, mode: "insensitive" as const } },
        { stage: { contains: q, mode: "insensitive" as const } }
      ] }] : []),
      ...(location ? [{ location: { contains: location, mode: "insensitive" as const } }] : [])
    ]
  };
  try {
    const [total, companies] = await db.$transaction([
      db.company.count({ where }),
      db.company.findMany({
        where,
        select: {
          id: true, name: true, slug: true, description: true, websiteUrl: true,
          logoUrl: true, industry: true, stage: true, location: true,
          _count: { select: { jobs: { where: { status: "PUBLISHED" } } } }
        },
        orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit
      })
    ]);
    return NextResponse.json({ data: companies, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" }
    });
  } catch {
    return NextResponse.json({ error: "Company directory is temporarily unavailable" }, { status: 503 });
  }
}