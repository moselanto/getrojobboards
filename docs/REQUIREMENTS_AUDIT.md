# Getro Community Recreation — Requirements Audit

**Repository:** `moselanto/getrojobboards`  
**Working branch:** `feature/getro-community-recreation`  
**Reference:** [Getro Community](https://community.getro.com/)  
**Audit status:** Initial public-surface audit; validate against live browser interactions before declaring parity.

## 1. Scope and boundaries

Build an independent, production-oriented community job-board application inspired by publicly observable Getro Community behavior. Recreate user-facing workflows and comparable functionality; do not copy proprietary source code, private datasets, branding assets, or bypass authentication/rate limits. Seed/demo listings must be labelled as sample data. Production job ingestion requires authorized feeds, employer submissions, or licensed APIs.

## 2. Public reference observations

The publicly indexed reference exposes primary navigation for **Jobs**, **Companies**, **Join talent network**, and **My job alerts**. The jobs view exposes keyword search, location, work arrangement, seniority, salary, and company filters. Listings commonly show title, company, location, compensation when available, posting age, tags/metadata, and a path to view the job. Search state appears in URL query parameters on some result pages. These are observations from public pages and search indexing, not a complete backend specification.

Reference: https://community.getro.com/jobs  
Reference: https://community.getro.com/companies

## 3. Functional requirements

### P0 — Core discovery
- Responsive jobs listing and job-detail pages with stable, shareable URLs.
- Search by title, company, description, and keywords.
- Filters: location, remote/hybrid/on-site, seniority, salary range, company, employment type, industry and company stage where data exists.
- Sorting, pagination, empty states, loading/error states, clear-all filters.
- Company directory, company profile and company-specific open roles.
- External apply links; show source and last-verified timestamp.
- Search-engine-friendly server rendering, canonical URLs, sitemap, robots rules and JobPosting structured data only where content meets eligibility requirements.

### P0 — Identity and candidate workflow
- Candidate sign-up/sign-in, email verification, secure session lifecycle and account recovery.
- Talent-network profile: skills, experience, location/work preferences, links and consent.
- Profile export and account deletion; clear privacy notice and data retention rules.
- Candidate data private by default; no public exposure of resumes or personal contact data.

### P0 — Admin and operations
- Role-based access control (admin, editor/reviewer, candidate).
- Admin overview and CRUD for jobs, companies, tags, imports, candidates and alert subscriptions.
- Review queue, audit trail, soft deletion, duplicate detection and moderation.
- CSV import/export with validation, dry-run preview and import error report.
- Dashboard metrics for active jobs, stale listings, alert delivery, search usage and ingestion health.

### P1 — Alerts and saved searches
- Save search criteria for authenticated candidates and support email alerts.
- Email verification, frequency preferences, deduplication, unsubscribe and delivery logs.
- Queue-backed sending with retries, rate limits and bounce/complaint handling.
- Alerts must only use jobs the platform is authorized to store/display.

### P1 — Job data lifecycle
- Manual employer/admin entry and authorized CSV/API/ATS ingestion adapters.
- Normalize job title, company, location, work arrangement, salary/currency/period, seniority, employment type, tags, source URL and timestamps.
- Idempotent upserts, source attribution, expiration/closure checks and stale-job suppression.
- No scraping or republishing of third-party listings without permission or a license.

### P1 — Production hardening
- Schema validation, CSRF protection where relevant, XSS-safe rendering, SQL injection prevention, rate limits and secure headers.
- Secrets only in environment variables/secret manager; no credentials in Git.
- Database migrations, backups/restore procedure, structured logs, monitoring and error reporting.
- Automated unit/integration/e2e tests, CI checks, accessibility checks and dependency scanning.

## 4. Recommended implementation stack

- **Web:** Next.js (App Router) + TypeScript, React, Tailwind CSS and accessible component primitives.
- **API:** Next.js server routes/server actions with a clear service/data-access boundary; split to a dedicated service only if scale requires it.
- **Database:** PostgreSQL with Prisma ORM and versioned migrations.
- **Authentication:** Auth.js or a maintained managed identity provider; secure email verification and role-based authorization.
- **Search:** PostgreSQL full-text search and indexed filters for MVP; evaluate Meilisearch/OpenSearch only when measured needs justify it.
- **Jobs/alerts:** Redis-backed queue (e.g. BullMQ) with a separate worker process; transactional outbox or equivalent reliable enqueue strategy.
- **Email:** Provider adapter (e.g. Resend/Postmark/SES) configured by environment; never hard-code provider credentials.
- **Testing/quality:** Vitest, Playwright, ESLint, type checking and CI.
- **Deployment:** Container-compatible hosting, managed PostgreSQL, managed Redis and object storage only if resume/file uploads are enabled.

Stack and provider choices should be confirmed against deployment budget and existing account access before production rollout.

## 5. Initial data model

- User, Role, CandidateProfile, ConsentRecord
- Company, CompanyTag
- Job, JobSource, JobTag, JobLocation, JobImportRun
- SavedSearch, AlertSubscription, AlertDelivery
- AdminAuditEvent, EmailVerificationToken, PasswordResetToken (if credentials auth is used)

Use UUIDs or equivalent non-guessable identifiers, normalized relations, unique source identifiers where available, timestamps and explicit status enums. Store only the candidate data required for stated purposes.

## 6. Routes to implement

- `/` — redirect or landing page
- `/jobs`, `/jobs/[slug]`
- `/companies`, `/companies/[slug]`
- `/join-talent-network`
- `/alerts`, `/saved-searches`
- `/auth/sign-in`, `/auth/sign-up`, `/auth/verify`, `/auth/forgot-password`
- `/account/profile`, `/account/privacy`
- `/admin`, `/admin/jobs`, `/admin/companies`, `/admin/candidates`, `/admin/imports`, `/admin/alerts`, `/admin/audit`

## 7. Acceptance criteria

1. Search/filter/sort/pagination can be combined and preserved in shareable URLs.
2. Job and company pages render correctly on mobile and desktop and have stable canonical URLs.
3. Candidates can verify email, manage a profile, save a search, manage alert frequency, unsubscribe and delete/export their account.
4. Unauthorized users cannot access admin routes or candidate-private data; authorization is enforced server-side.
5. Admins can create/edit/archive jobs and companies, import a CSV safely, inspect errors and identify stale listings.
6. Alerts are deduplicated, retryable, observable and include functional unsubscribe links.
7. Database migrations run cleanly from an empty database; tests and type checks run in CI.
8. No secrets or unlicensed production listings are committed. Sample content is explicitly marked as demo data.
9. Accessibility, metadata, structured data and performance are tested before launch.

## 8. Known gaps / next audit steps

- Confirm exact live behavior of filters, sorting, pagination, query-state encoding, company detail, job detail, alert signup and talent-network forms with a browser session.
- Capture representative desktop/mobile screenshots and interaction notes; distinguish observed facts from inferred behavior.
- Decide hosting, auth, email, queue and job-data source based on credentials/budget.
- Do not claim exact parity until these flows are tested against the live reference.
