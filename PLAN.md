# Implementation Plan — Portfolio v2

**Companion to:** [PRD.md](./PRD.md)
**Target:** Ship v1 in ~4 weekends. v1.1 additions can trail.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | RSC gives us runtime data fetching without shipping JS; edge functions for GitHub sync + `curl` responses; on-demand revalidation built in. |
| Language | **TypeScript, strict** | Non-negotiable at staff level. |
| Styling | **Tailwind v4 + CSS variables** | Utility density fits terse aesthetic; CSS vars carry the OKLCH design tokens across light/dark. |
| Content | **MDX via `@next/mdx` + `next-mdx-remote-client`** | RSC-native, fast, MDX gives us custom components inside posts. |
| Syntax highlighting | **Shiki (build-time)** | Zero client JS, VSCode-grade themes, supports twoslash if we want it later. |
| Data | **File-system + edge API routes** | No DB. YAML for experience, MDX for posts, JSON snapshot fallback. |
| Hosting | **Vercel** | Edge runtime, ISR, `@vercel/og`, generous free tier. |
| Analytics | **Plausible (self-hosted) or Vercel Analytics** | No cookie banner. |
| Fonts | **JetBrains Mono + Inter, self-hosted via `next/font`** | No FOUT, no third-party requests, GDPR-clean. |
| Search | **Command palette client-side index** | Built at build time; ~15 KB JSON; Fuse.js for fuzzy. |
| KV (guest log) | **Vercel KV or Upstash Redis free tier** | Only if guest log ships in v1.1. |

**Explicitly not chosen:**
- No Astro (Next's RSC + edge story is stronger for the runtime-sync requirement).
- No Contentlayer (unmaintained; MDX + Zod schema is enough).
- No CSS-in-JS runtime (perf budget forbids it).

---

## 2. Repository Layout

```
Portfolio/
├── PRD.md
├── PLAN.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts              # if v4 config file needed; else all in globals.css
├── biome.json                      # linter + formatter (single tool, fast)
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml                  # typecheck, lint, build
│       ├── nightly-snapshot.yml    # writes projects.snapshot.json
│       └── syndicate.yml           # cross-post on writing changes
├── app/
│   ├── layout.tsx                  # root, theme provider, fonts, palette host
│   ├── globals.css                 # tokens + resets + prose styles
│   ├── page.tsx                    # /
│   ├── writing/
│   │   ├── page.tsx                # index
│   │   ├── [slug]/page.tsx
│   │   └── tag/[tag]/page.tsx
│   ├── work/page.tsx
│   ├── projects/page.tsx
│   ├── now/page.tsx
│   ├── uses/page.tsx
│   ├── resume/page.tsx             # print stylesheet
│   ├── whoami/page.tsx             # man-page styled
│   ├── rss.xml/route.ts
│   ├── feed.json/route.ts
│   ├── sitemap.xml/route.ts
│   ├── og/route.tsx                # dynamic OG images (text-only)
│   └── api/
│       ├── github/projects/route.ts     # edge, ISR-cached
│       ├── revalidate/route.ts          # webhook target
│       └── plaintext/route.ts           # curl responses (Accept negotiation)
├── content/
│   ├── writing/*.mdx
│   ├── projects/*.md               # per-repo overrides (optional)
│   ├── experience.yaml             # roles
│   ├── now.mdx
│   ├── uses.mdx
│   ├── projects.snapshot.json      # nightly-refreshed fallback
│   └── .syndication-lock.json      # slug → { devto_id, hash }
├── components/
│   ├── palette/CommandPalette.tsx
│   ├── boot/BootSequence.tsx
│   ├── theme/ThemeToggle.tsx
│   ├── typography/Prose.tsx
│   ├── charts/Sparkline.tsx        # ASCII, pure text
│   ├── layout/Nav.tsx
│   ├── layout/Footer.tsx
│   ├── ui/StatusDot.tsx
│   ├── ui/PostMeta.tsx
│   └── mdx/                        # custom MDX components
├── lib/
│   ├── github.ts                   # GraphQL client, normalization
│   ├── mdx.ts                      # frontmatter parse, TOC, reading time
│   ├── content.ts                  # writing/experience loaders
│   ├── plaintext.ts                # ANSI résumé renderer
│   ├── training.ts                 # optional (v1.1) — data source TBD
│   ├── og.tsx                      # OG template
│   ├── schema.ts                   # Zod schemas for frontmatter
│   └── search-index.ts             # built at build time
├── scripts/
│   ├── sync-github-snapshot.ts     # runs in nightly action
│   └── syndicate.ts                # cross-post to dev.to
├── public/
│   ├── fonts/                       # self-hosted woff2
│   ├── robots.txt
│   └── humans.txt
└── types/
    └── index.ts
```

---

## 3. Design System

### Typography
- **Chrome / labels / code:** JetBrains Mono (self-hosted, subset).
- **Body:** Inter (self-hosted, subset — Latin only, saves ~40 KB).
- **Scale:** 12 / 14 / 16 / 18 / 24 / 32 / 48 — no more. Monospace-only variant of scale for terminal blocks.
- **Line length:** `max-w-[68ch]` for prose. Never wider.

### Color (OKLCH tokens in `globals.css`)
```
--bg          : oklch(99% 0.005 250)   /* light */ | oklch(14% 0.01 250)  /* dark */
--fg          : oklch(20% 0.01 250)                | oklch(94% 0.005 250)
--muted       : oklch(50% 0.01 250)                | oklch(62% 0.01 250)
--accent      : oklch(60% 0.18 155)                | oklch(72% 0.18 155)  /* terminal green */
--border      : oklch(90% 0.01 250)                | oklch(24% 0.01 250)
```
Two-color palette per theme (fg + accent). Muted for secondary text. No gradients, no shadows on primary surfaces.

### Motion
- Global `prefers-reduced-motion: reduce` respected.
- Timings: 120ms (micro), 200ms (page transitions), 400ms (boot). Nothing longer.
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for all.

---

## 4. Key Modules — how they work

### 4.1 GitHub sync (`lib/github.ts` + `app/api/github/projects/route.ts`)

```ts
// Edge runtime. Cached with tag 'github:projects'.
// Returns normalized project list. Merges per-repo overrides.
// On error: reads content/projects.snapshot.json as last-known-good.
```

- **GraphQL query:** for user `sanishchirayath1` — pinned repos + repos with topic `portfolio`, single request.
- **Auth:** fine-grained PAT with `public_repo:read` only, tied to `sanishchirayath1`. Stored as `GITHUB_TOKEN` in Vercel.
- **Caching:** `unstable_cache(fn, ['github:projects'], { revalidate: 600, tags: ['github:projects'] })`.
- **Invalidation:** `/api/revalidate` accepts GitHub webhook, verifies HMAC signature, calls `revalidateTag('github:projects')`.
- **Snapshot fallback:** `scripts/sync-github-snapshot.ts` runs nightly via Action, commits `projects.snapshot.json`. If the runtime API throws, we serve the snapshot.

### 4.2 Writing pipeline (`lib/mdx.ts` + `lib/content.ts`)

- All MDX under `content/writing/`. Frontmatter validated by Zod schema (`lib/schema.ts`).
- At build: compute reading time, extract headings for TOC, generate slug from filename.
- Shiki processes fenced code blocks with the site's two themes (`min-light` + `github-dark-default` for consistency with brand).
- RSS/JSON Feed routes emit from the same loader.

### 4.3 Syndication (`scripts/syndicate.ts` + `.github/workflows/syndicate.yml`)

- **Syndication targets:** dev.to only. `blogs.hstart.in` is *not* a syndication target — its two existing posts migrate to native MDX in `content/writing/` (see PRD §6.7) and the domain is deprecated post-cutover.
- Trigger: push to `main` where `content/writing/**` changed.
- Reads `.syndication-lock.json`, computes hash per post, decides create vs update vs skip.
- dev.to: `POST /api/articles` (create) or `PUT /api/articles/{id}` (update). Sets `canonical_url` + `published: true`.
- Content transform: MDX → plain markdown via `remark-mdx` + custom stringifier that drops or falls back on custom components.
- Commits the updated lock file back to `main` via `github-actions[bot]`.
- Failure: post a Slack/GitHub-comment via a follow-up step; never blocks the site deploy.

### 4.4 Command palette (`components/palette/CommandPalette.tsx`)

- Built on `cmdk` (~5 KB gz).
- Data sources: post titles + slugs, project names, static pages, actions.
- Index built at build time as `search-index.json`, imported statically.
- Actions:
  - `copy email`, `copy github`, `copy linkedin`
  - `download résumé` (PDF from `/resume` printed via headless print CSS)
  - `toggle theme`, `toggle verbose mode`
  - `open latest post`, `open latest project`
- Shortcut: `⌘K` / `Ctrl+K`. Also `?` for shortcut cheatsheet.

### 4.5 Boot sequence (`components/boot/BootSequence.tsx`)

- Runs on first visit only (localStorage flag).
- Skippable with any keystroke.
- Content: 4 lines, typewriter effect, 400ms total.
- Reduced-motion → instant render.

### 4.6 `curl` support (`app/api/plaintext/route.ts` + middleware)

- Middleware inspects `User-Agent` and `Accept` header. If `curl` or `Accept: text/plain`, rewrite to `/api/plaintext?path=/`.
- Route returns ANSI-colored plaintext résumé/status/etc. depending on `path`.
- Uses `lib/plaintext.ts` — small ANSI renderer, ~1 KB. No dependency.
- Also served at `/resume.txt` for good measure.

### 4.7 ASCII sparklines (`components/charts/Sparkline.tsx`)

- Pure text: `▁▂▃▄▅▆▇█` mapped to normalized values.
- Source: GitHub commit activity (last 52 weeks, via `github.ts`). Training-load sparkline deferred to v1.1 pending a data source (see PRD §7.4).
- Renders as `<span aria-label="...">` for screen readers.

### 4.8 Theme (`components/theme/ThemeToggle.tsx`)

- `next-themes` (or a 20-line handwritten equivalent — decide at implementation).
- Storage: `localStorage`. SSR: reads `Sec-CH-Prefers-Color-Scheme` client hint when available; otherwise renders both and swaps client-side without flash via inline script in `layout.tsx`.

---

## 5. Milestones — detailed

### M0 — Scaffold (½ weekend)
- `pnpm create next-app` + strip everything Next adds by default.
- Add Biome, tsconfig strict, Tailwind v4, self-hosted fonts.
- Set up Vercel project, preview deploys, custom domain staging (`v2.portfolio.hstart.in`).
- CI: `pnpm typecheck && pnpm build && pnpm lint`.
- **Exit:** blank home deploys green, Lighthouse ≥ 98 on empty page.

### M1 — Content pages, no dynamism (1 weekend)
- Home, `/work`, `/uses`, `/now`, `/resume`, `/whoami` — all static from `content/*`.
- Design system tokens, prose styles, layout components.
- Theme toggle working.
- Keyboard nav (`j/k` on timelines, `g h` to home, etc.).
- Sitemap, robots, humans.txt.
- **Exit:** Personal content live. Keyboard-complete. Print `/resume` looks clean on A4.

### M2 — Writing pipeline (1 weekend)
- MDX loader + Zod schema.
- `/writing`, `/writing/[slug]`, `/writing/tag/[tag]`.
- Shiki code blocks with copy button, filename, line-highlight.
- RSS + JSON Feed + sitemap entries.
- Dynamic OG image generator (`app/og/route.tsx`, text-only template).
- **Exit:** First MDX post renders end-to-end. Feed validates on W3C.

### M3 — GitHub auto-sync (1 weekend)
- `lib/github.ts` GraphQL client + normalization.
- Edge route with `unstable_cache` + tag.
- Webhook endpoint with HMAC verification.
- Nightly snapshot Action + fallback logic.
- Per-repo override merge.
- `/projects` page + home pinned list.
- **Exit:** Push a new repo to GitHub with topic `portfolio` → appears on site within 30s without redeploy. Kill API access → site still serves snapshot.

### M4 — Surprise elements v1 (½ weekend)
- `⌘K` palette with all v1 actions.
- Boot sequence.
- `curl` middleware + plaintext route + ANSI renderer.
- Konami code → verbose mode.
- ASCII sparkline for GitHub commits.
- Tab-title reading progress.
- **Exit:** All six work. Reduced-motion honored. No layout shift when boot runs.

### M5 — Syndication (½ weekend)
- `scripts/syndicate.ts` + GH Action.
- dev.to API integration.
- Content transform for MDX → plain markdown.
- Lock file mechanism.
- **Exit:** Publishing a post to `main` results in a copy on dev.to within 2 min, pointing back canonically. Editing the post updates it without duplicates.

### M6 — Cutover
- 301 redirects from any v1 URLs worth preserving.
- Point `portfolio.hstart.in` DNS to Vercel.
- Configure 301 redirects from `blogs.hstart.in/*` → `portfolio.hstart.in/writing/*`. Concrete mapping:
  ```
  blogs.hstart.in/automate-aws-infrastructure-deployment-with-aws-cdk-a-lazy-engineers-guide
    → portfolio.hstart.in/writing/deploying-a-static-website-with-aws-cdk

  blogs.hstart.in/hosting-a-static-website-on-aws-s3-with-cicd
    → portfolio.hstart.in/writing/hosting-a-static-website-on-aws-s3-with-cicd
  ```
  Implementation: `next.config.mjs` `redirects()` for path-level rules if `blogs.hstart.in` is served by the same Vercel project; otherwise Cloudflare page rules.
- Verify RUM data flowing.
- Announce.

### v1.1 (post-launch, opportunistic)
- Training data on `/now` (source TBD — manual YAML, Fitbit, or Polar).
- Ambient market strip.
- Guest log with KV backing.
- Live status dot.
- Newsletter (Buttondown/Resend).

---

## 6. Files to be Created (M0–M3 scope)

Root: `package.json`, `tsconfig.json`, `next.config.mjs`, `biome.json`, `.env.example`, `.gitignore`.

Config: `app/globals.css` (tokens + resets), `app/layout.tsx`, `lib/schema.ts`, `types/index.ts`.

Pages (M1): `app/page.tsx`, `app/work/page.tsx`, `app/uses/page.tsx`, `app/now/page.tsx`, `app/resume/page.tsx`, `app/whoami/page.tsx`.

Pages (M2): `app/writing/page.tsx`, `app/writing/[slug]/page.tsx`, `app/writing/tag/[tag]/page.tsx`, `app/rss.xml/route.ts`, `app/feed.json/route.ts`, `app/sitemap.xml/route.ts`, `app/og/route.tsx`.

Pages (M3): `app/projects/page.tsx`, `app/api/github/projects/route.ts`, `app/api/revalidate/route.ts`, `scripts/sync-github-snapshot.ts`.

Content seeds: `content/experience.yaml`, `content/now.mdx`, `content/uses.mdx`, `content/writing/hello-world.mdx`.

Libs: `lib/github.ts`, `lib/mdx.ts`, `lib/content.ts`.

Components: `components/layout/{Nav,Footer}.tsx`, `components/theme/ThemeToggle.tsx`, `components/typography/Prose.tsx`, `components/ui/StatusDot.tsx`.

Workflows: `.github/workflows/{ci,nightly-snapshot}.yml`.

---

## 7. Verification

**Per-milestone gates** (run locally + in CI):
- `pnpm typecheck` — zero errors.
- `pnpm build` — succeeds, bundle report reviewed.
- `pnpm lint` — Biome clean.
- Lighthouse CI on preview URL — perf ≥ 98, a11y = 100, best-practices ≥ 95, SEO = 100.

**Manual smoke:**
- Keyboard-only navigation across home, `/writing`, `/work`, `/projects`.
- Screen reader: VoiceOver walk-through of home + one post.
- Print preview of `/resume` fits one A4 page.
- `curl -A curl https://<preview>` returns ANSI résumé.
- Disable JS → home, `/writing/*`, `/work` all readable.
- Toggle system theme mid-session → site follows within one paint.

**M3 acceptance test (auto-sync):**
1. Note current project list on `/projects`.
2. Push a new dummy repo with topic `portfolio` and description.
3. Confirm webhook fires (check Vercel logs).
4. Reload `/projects` — new repo visible within 30s, no deploy triggered.
5. Delete `GITHUB_TOKEN` env var → route falls back to `projects.snapshot.json`, site stays up.

**M5 acceptance test (syndication):**
1. Draft `content/writing/test-post.mdx` with `draft: false`.
2. Push to `main`.
3. Action runs; check dev.to dashboard for the post.
4. Confirm `canonical_url` points to `portfolio.hstart.in/writing/test-post`.
5. Edit the post, push again — same URL updated, no duplicates.
6. Set `syndicate: false`, push again — action skips.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| GitHub API rate limit / outage | Snapshot fallback; edge cache absorbs traffic; authenticated PAT gets 5000/hr. |
| Vercel edge cold-start latency on `/api/github/projects` | Warmed by home page's server component; SWR keeps hot copy served during revalidate. |
| dev.to API breaking changes | Syndication is a nice-to-have; failure never blocks portfolio deploy. Version-pin the API and log clearly. |
| Custom MDX components in posts that don't syndicate | Lint step in syndicate script — warn on unsupported components; author decides to inline or opt-out per post. |
| Design gets fussy without images to hide behind | Design constraint = feature; enforce via lint rule "no <img>" and by keeping the palette to 2 colors. |
| Scope creep on surprise elements | Fixed v1 list in PRD §8; anything else is v1.1. |

---

## 9. Ready to Start?

Next actions on approval:
1. Initialize Next.js + Vercel project (M0).
2. Seed content is already in `content/` (see `experience.yaml`, `identity.yaml`, `now.mdx`, `uses.mdx`, and the two writing placeholders). Any edits happen inline as content evolves.
3. First preview deploy live within an hour.
