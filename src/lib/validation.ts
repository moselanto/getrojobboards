import { z } from "zod";

const optionalUrl = z.string().trim().url().max(2048).optional().or(z.literal(""));
const safeSlug = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

export const jobInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: safeSlug,
  description: z.string().trim().min(30).max(30000),
  location: z.string().trim().max(160).optional(),
  arrangement: z.enum(["REMOTE", "HYBRID", "ON_SITE", "UNSPECIFIED"]).default("UNSPECIFIED"),
  employmentType: z.string().trim().max(80).optional(),
  seniority: z.string().trim().max(80).optional(),
  salaryMin: z.number().int().nonnegative().max(100000000).optional(),
  salaryMax: z.number().int().nonnegative().max(100000000).optional(),
  salaryCurrency: z.string().trim().length(3).toUpperCase().optional(),
  applyUrl: z.string().trim().url().max(2048),
  companyId: z.string().min(1).max(100)
}).refine(data => data.salaryMin === undefined || data.salaryMax === undefined || data.salaryMax >= data.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salaryMax"]
});

export const companyInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: safeSlug,
  description: z.string().trim().max(10000).optional(),
  websiteUrl: optionalUrl,
  logoUrl: optionalUrl,
  industry: z.string().trim().max(120).optional(),
  stage: z.string().trim().max(80).optional(),
  location: z.string().trim().max(160).optional()
});

export const candidateInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  headline: z.string().trim().max(160).optional(),
  summary: z.string().trim().max(5000).optional(),
  skills: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  location: z.string().trim().max(160).optional(),
  workPreferences: z.array(z.enum(["REMOTE", "HYBRID", "ON_SITE"])).max(3).default([]),
  websiteUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  consent: z.literal(true)
});