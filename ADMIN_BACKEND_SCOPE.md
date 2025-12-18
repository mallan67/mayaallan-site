# ADMIN BACKEND — SCOPE OF PROJECT

**Project name:** Maya Allan — Single-Admin Content Platform  
**Purpose:** A single-admin backend where nothing appears on the public site unless **you** explicitly allow it. Everything content-wise is draft-by-default; admin controls all show/hide decisions.

---

## 1 — Core Principles (non-negotiable)
- **Single Admin Login** (email + password).  
- **No public user accounts** and **no user-generated content** (no comments, reviews).  
- **Everything is draft by default**. Content only appears on the front end when `isPublished`/`isVisible = true`.  
- **Show / Hide control** is explicit in admin UI for every content item.  
- Frontend renders **only** items you mark visible.  
- No front-end styling changes unless you request them; I add backend data and admin endpoints only.

---

## 2 — Final Admin Capabilities (what the backend must support)

### 2.1 Books (primary)
- Manage books with full CRUD. Fields:
  - `title`, `subtitle1`, `subtitle2`, `tags/keywords`, `copyright`, `ISBN`, `shortDescription`.
  - `coverUrl`, `backCoverUrl` (optional).
  - `isPublished`, `isComingSoon`, `allowDirectSale`.
- **Formats**: `EBOOK`, `HARDCOVER`, `PAPERBACK` — per-book, per-format records with price and `isActive`.
- **Sales logic** (final): for each format:
  - Retailers (global list). Per-book `BookRetailerLink` with `formats` array specifying which formats each retailer sells and `active` flag.
  - If **no active retailers** for a format **AND** `allowDirectSale == false` → show **“Coming Soon”** (or blank) for purchase area.
  - If retailers exist for a format, only show active retailer links for that format.
  - If `allowDirectSale == true`, show payment UI (Stripe/PayPal) and record sales in `sales` table.

### 2.2 Direct Sales
- `allowDirectSale` per book controls direct sale UI.
- Support **Stripe** and **PayPal** (Phase 1: both).  
- Record `sales` (bookId, format, amountCents, currency, provider, providerId, purchaserEmail, timestamp).

### 2.3 Media (audio & video & misc)
- Upload file or external link (YouTube/Vimeo).
- Fields: `title`, `description`, `coverImage`, optional `ISBN`, `fileUrl` or `externalUrl`.
- Media can be attached to a book or standalone. Only shows on front-end when `isPublished == true`.
- Support extra attachments: gift file, music, guide video.

### 2.4 Events / Meetups
- Add events with `startsAt`, `endsAt`, `location` or `url`.
- `isPublished`, `hidePast` per event; admin chooses whether past events remain visible.
- Events tab appears only if there are published events.

### 2.5 CRM (light)
- Capture `contact_submissions` (name, email, message, source, timestamp).
- Store email subscribers separately.
- Admin export CSV of contact submissions.

### 2.6 Marketing & SEO with AI
- Admin can control metadata (metaTitle, metaDescription, OG tags, JSON-LD schema).
- System aggregates search signals (internal search logs + optional Google Search Console / Keyword Planner / SEO API) and **AI-suggests** high-volume keywords and metadata (with estimated volumes).
- AI suggestions stored and auditable; admin accepts/rejects before saving.
- This is a suggestion workflow — admin approval required. (Phase 1: AI-assisted SEO included.)

### 2.7 Flexible Custom Fields
- Admin may add new fields (tags, text, file uploads, selects) to any section at runtime without code changes.
- Implemented with `field_definitions` (admin-controlled) + `customFields` JSONB stored on each content record.
- Admin form UI renders dynamically from `field_definitions` for each section.

### 2.8 E-book generation
- Generate EPUB from book content (admin export).
- Option A: **EPUB only** (Phase 1). Admin downloads EPUB and uploads to KDP manually (works for Kindle).  
- Option B: **EPUB + automated Calibre conversion** to MOBI/AZW3 via a container worker (optional; Phase 2 if chosen).  
- Admin UI: export EPUB button, queue conversion jobs (if Calibre worker enabled) and download results.

### 2.9 Rotating Site Art Panel (admin-managed)
- Backend-managed site-art images: store metadata (position left/right, order, duration, caption, alt text, isPublished).
- Public endpoint provides ordered published images; **no front-end style changes** are made by me — your front end will consume the data and render it in whatever style already exists.  
- Admin can manage images and position via admin endpoints.

---

## 3 — Tech Stack (final)
- Next.js (App Router) + TypeScript + Tailwind  
- **Drizzle ORM** (drizzle-orm/postgres-js) + Postgres (Vercel Postgres)  
- Storage: **(choose)** AWS S3 (recommended) / Cloudflare R2 / Vercel Storage — signed upload flow.  
- Payments: Stripe + PayPal (Phase 1).  
- AI: OpenAI (or enterprise alternative) server-side for SEO suggestions (Phase 1).  
- Deployment: Vercel.

---

## 4 — Data Model (Drizzle summary)
Key tables (exact columns implemented in `src/db/schema.ts`):

- `admin_users`  
- `books` (plus `customFields` JSONB)  
- `book_formats` (per-format price & active)  
- `retailers`  
- `book_retailer_links` (`formats` JSON array)  
- `media_items`  
- `site_art_images` (links to media_items)  
- `events`  
- `contact_submissions`  
- `email_subscribers`  
- `site_settings` (includes siteArtPosition/siteArtWidth/siteArtDefaultDuration)  
- `sales`  
- `field_definitions` (dynamic field manager)  
- `search_logs` (internal queries)  
- `seo_suggestions` (AI output & keyword volumes)

---

## 5 — API surface (App Router routes)

**Admin (protected)**
- `POST /api/admin/login` — authenticate -> set admin cookie  
- `POST /api/admin/logout`  
- `GET/POST /api/admin/books`  
- `GET/PATCH/DELETE /api/admin/books/[id]`  
- `POST /api/admin/books/[id]/formats` — manage per-format pricing  
- `GET/POST /api/admin/retailers` + `[id]`  
- `GET/POST /api/admin/books/[id]/retailers` — create BookRetailerLink with `formats` & `active`  
- `GET/POST /api/admin/media` + `[id]`  
- `GET/POST /api/admin/events` + `[id]`  
- `GET /api/admin/contact-exports` (CSV)  
- `GET/POST /api/admin/site-settings`  
- `GET/POST /api/admin/site-art` + `[id]`  
- `POST /api/admin/seo/generate` — AI suggestion endpoint  
- `POST /api/admin/ebooks/export` — create EPUB / queue conversion

**Public**
- `GET /api/site-art` — returns published site art images (ordered)  
- `POST /api/contact` — public contact form (rate-limited)  
- `POST /api/subscribe` — email subscribe  
- `POST /api/payments/stripe/create-session` + `POST /api/payments/stripe/webhook`  
- `POST /api/payments/paypal/create-order` + webhook

**Helpers**
- `GET /api/upload/signed-url` — get S3/R2 signed PUT URL for uploads.

---

## 6 — Auth & Sessions
- Single admin account stored in `admin_users` (passwordHash with bcrypt).  
- JWT signed token stored as HttpOnly cookie `admin_session`, `SameSite=Lax`, secure in production.  
- `requireAdmin(req)` server helper verifies JWT and enforces admin protection on `/api/admin/*` routes.

---

## 7 — SEO & AI (exact)
- Aggregate search signals (internal search logs + optional Google Search Console / Keyword Planner / SEO APIs) to get candidate keywords and volumes.  
- AI (server-side) is used to produce metadata suggestions and keyword recommendations with estimated/actual volumes.  
- Suggestions are saved in `seo_suggestions`; admin accepts/rejects before they apply.  
- Prompt templates with structured JSON output and server-side validation/parsing included.

---

## 8 — Custom Fields (exact)
- `field_definitions` table governs which custom fields exist for each section.  
- `customFields` JSONB on records stores values.  
- Admin UI: `field_definitions` CRUD and dynamic form rendering in the content editor. Validation and types enforced client-side based on field definition. Unused fields ignored in the front-end.

---

## 9 — E-book pipeline (exact)
- **Phase 1**: EPUB generator in Node (`epub-gen` or similar); produces EPUB; saves to storage; admin downloads.  
- **Phase 2 (optional)**: Calibre-based conversion worker (container or VM), job queue to convert EPUB → MOBI/AZW3; admin downloads converted files.  
- Admin chooses which formats to make available for each retailer.

---

## 10 — Rotating Art (backend-only changes)
- Add `site_art_images` table linking `media_items` with position, order, duration, caption, alt, isPublished.  
- Admin CRUD endpoints to manage site art.  
- Public `GET /api/site-art` to return published art.  
- **No change to existing front-end styles** — front-end consumes `GET /api/site-art` and renders images using your current layout/styling. Optional example rotating component provided separately but not applied to your styles.

---

## 11 — Security & compliance
- Bcrypt password hashing (>=12 rounds).  
- Secure cookies, JWT secret, and server-side rate-limiting for login & contact form.  
- Validate all inputs via `zod`.  
- Stripe & PayPal webhook verification.  
- AI prompt logging and data minimization (no PII sent to AI).  
- Signed uploads and secure bucket policy.  
- CSP and CORS rules as needed.

---

## 12 — Migrations, seed & commands
- `drizzle.config.ts` for migrations.  
- Commands:
  - `npx drizzle-kit generate`  
  - `npx drizzle-kit push`  
  - `node scripts/seed.ts` (or `ts-node`) — seed initial admin user.  
  - `npm run dev` or `pnpm dev` for local dev.

**Environment variables**
\`\`\`
DATABASE_URL
JWT_SECRET
S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY (or R2 variants)
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
PAYPAL_CLIENT_ID, PAYPAL_SECRET (optional)
OPENAI_API_KEY (AI)
NODE_ENV
\`\`\`

---

## 13 — Phase plan & deliverables

**Phase 1 (Immediate priority)**
- Final Drizzle schema (with `book_formats`, `book_retailer_links.formats`, `customFields`, `field_definitions`, `seo_suggestions`, `search_logs`, `site_art_images`).  
- Guarded DB client.  
- Admin auth (login/logout) + `requireAdmin`.  
- Books CRUD + BookFormats + Retailer CRUD + BookRetailerLink endpoints.  
- Storage (signed-upload helper for S3/R2).  
- Public `GET /api/site-art`.  
- SEO AI generator endpoint (server-side) and `seo_suggestions` storage.  
- EPUB export endpoint + admin button.  
- Admin UI skeleton for Books, Retailers, Site Art, SEO panel (no style changes).  
- Stripe & PayPal start (create-session + webhook) and sale recording.

**Phase 2**
- Media manager, Events, CRM CSV export.  
- Calibre conversion worker (if chosen).  
- Polishing custom fields UI, full admin UX.  
- Tests, CI workflow, monitoring.

---

## 14 — Acceptance criteria (how we know it’s done)
- Admin can log in and manage Books, Retailers, BookRetailerLink, BookFormats, and Site Art.  
- `GET /api/site-art` returns ordered published images with metadata.  
- Admin signed-upload flow works and media can be attached to site-art.  
- Frontend (unchanged styles) can fetch `/api/site-art` and display images.  
- Books sales logic enforced: if no active retailers for a format and `allowDirectSale == false` → front-end purchase area shows **Coming Soon** (or blank).  
- AI SEO suggestion endpoint returns structured suggestions including keyword volumes; admin can accept/reject and save metadata.  
- EPUB export available for each book.  
- `npx tsc --noEmit` and `npx next build` succeed with guarded DB client.  
- Security: login rate limits and cookie flags set; webhook verification implemented.

---

## 15 — Where we stopped and current state (hand-off)
- Repo cleaned of old Prisma artifacts. Guarded DB client implemented. `main` builds cleanly.  
- We prepared Drizzle schema drafts and admin/login skeletons.  
- Next step: finalize Drizzle schema additions, signed-upload helper for chosen storage provider, admin site-art endpoints, SEO AI endpoint, EPUB export.  
- I will **not** change your existing front-end styles.  I will only add backend endpoints and admin UI skeletons; you choose whether to incorporate the optional rotating art component I provided.

---

## 16 — Quick decisions I still need from you
Please confirm (or I will proceed with the defaults below):

1. **Storage provider**: `AWS S3` (recommended default) / `Cloudflare R2` / `Vercel Storage`.  
   - Default: **AWS S3**.  
2. **Payments for Phase 1**: Implement **Stripe + PayPal**?  
   - Default: **Yes (both)**.  
3. **AI SEO in Phase 1**: include AI suggestions + GSC/keyword integration (admin can accept/reject)?  
   - Default: **Yes**.  
4. **Ebook conversion**: **A)** EPUB-only export (Phase 1) or **B)** EPUB + automated Calibre conversion worker (Phase 1)?  
   - Default: **A** (EPUB-only now; Calibre worker optional later).  
5. **Tags**: `JSON array` for tags OK?  
   - Default: **Yes (JSON array)**.

---

## 17 — Next actions I will take after your confirmation
- Generate the final `src/db/schema.ts` with additions and `drizzle.config.ts`.  
- Add `src/lib/storage-s3.ts` (or R2 variant) and signed upload route.  
- Add `app/api/site-art`, `app/api/admin/site-art/*` admin routes.  
- Add `app/api/admin/seo/generate` and `seo_suggestions` table.  
- Add EPUB export API + admin UI hook.  
- Add example admin-rights wiring `requireAdmin` usage and admin UI skeleton for Books & Site Art.  
- Commit files to `main` (or create PR if you prefer).

---

## How to save this scope in the repo
Copy this file and save it as `ADMIN_BACKEND_SCOPE.md` in the repo root. If you’d like, I will create the file and commit it to `main` now — say **“Create scope file in repo”** and tell me whether to commit directly to `main` or open a PR/branch.

---

If this document matches your expectations, reply with:
- Confirmations for the five decisions (storage, payments, AI, ebook conversion, tags), and  
- Tell me whether to **commit Phase 1 files to `main` now** or **produce a PR/patch for review**.

Once you confirm, I’ll scaffold Phase 1 exactly as specified and add the scope file into the repository.
