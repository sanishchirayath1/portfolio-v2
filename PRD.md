# PRD — Sanish Chirayath's Portfolio v2

**Author:** Sanish Chirayath
**Status:** Draft v0.1
**Date:** 2026-07-14
**Replaces:** portfolio.hstart.in (v1)

---

## 1. Context & Vision

The current portfolio at `portfolio.hstart.in` exists, but it doesn't reflect the level of craft I want associated with my name. This rebuild is a deliberate re-introduction: a site that looks like it was built by a developer who cares about the details, hosts my writing, and pulls the rest of the world (GitHub, sports, work history) into a single, honest surface.

**One-line pitch:** A text-forward, terminal-inspired portfolio that reads like a well-designed CLI — minimal, fast, keyboard-native, and quietly playful — that keeps itself up to date without me touching a deploy button.

**Success looks like:** A recruiter, engineer, or friend lands on the site, understands who I am within 15 seconds, finds one thing that surprises them, and remembers the site a week later.

---

## 2. Goals

### Primary goals
1. **Establish a distinctive developer identity** — no template smell, no stock illustrations, no generic hero section.
2. **Publish long-form writing** — first-class blog with MDX, code blocks that behave, RSS, permalinks.
3. **Self-updating projects** — GitHub repos surface automatically. No redeploy required when I ship a new repo, star something, or pin a project.
4. **Show experience with clarity** — roles, dates, scope, and impact in a scannable, printable form.
5. **Signal personality** — coding, finance, and sports (swimming / cycling / calisthenics) are visible without being loud.
6. **Load fast, work everywhere** — sub-1s LCP on 4G; fully functional with JS disabled for core content.

### Non-goals
- No image-heavy design. No hero photo, no project screenshots, no illustrations.
- No CMS UI to log into. Content is code (MDX, JSON, YAML) or fetched at runtime.
- No analytics that require cookie banners. Privacy-respecting only.
- No paid dependencies for v1.
- No "AI chatbot that answers as me." Overdone.

---

## 3. Target Audience

| Audience | What they need in ≤ 15s |
|---|---|
| Hiring managers / recruiters | Role, seniority, company logos or names, contact link |
| Engineers evaluating me | Live GitHub activity, blog quality, code snippets |
| Fellow builders / friends | Something that makes them smile — an easter egg, a clever detail |
| Future me | A place I'm proud to point at |

---

## 4. Design Principles

1. **Text is the primary medium.** No images. Typography, spacing, and monospace do the heavy lifting.
2. **Terminal, not skeuomorphism.** Inspired by the terminal — not a costume of one. Modern rendering, real web typography, subtle motion.
3. **Keyboard is a first-class input.** Every navigation action has a shortcut. `⌘K` command palette is core, not an afterthought.
4. **Density with air.** Information-dense where it matters (experience, projects). Generous whitespace where it doesn't.
5. **Motion earns its place.** Animations exist to communicate state or reward curiosity — never for decoration.
6. **Progressive disclosure.** The default view is calm. Detail is one keystroke away.
7. **Honest.** No fake metrics, no invented testimonials, no lorem ipsum in production.

---

## 5. Information Architecture

Single-page primary experience with dedicated routes for depth.

```
/                       — home (identity, current status, latest 3 posts, pinned projects)
/writing                — blog index (chronological, tag filter)
/writing/[slug]         — post detail
/work                   — full experience timeline
/projects               — full project list (auto-synced from GitHub)
/now                    — what I'm working on / training / reading this week
/uses                   — hardware, software, dotfiles
/rss.xml, /feed.json    — feeds
/resume                 — printable CV view (same data, print stylesheet)
/api/github/projects    — cached edge endpoint powering /projects
/api/revalidate         — webhook target for on-demand refresh
```

**Text-mode fallbacks (surprising elements, see §8):**
- `curl portfolio.hstart.in` returns a plaintext résumé
- `curl portfolio.hstart.in/now` returns current-status plaintext

---

## 6. Content Requirements

### 6.1 Home
- Name: Sanish Chirayath. Headline: Software Development Engineer. Location: Bangalore.
- **Status line** (auto-updated): "Currently at Bruno · training swim + cycle · planning calisthenics"
- Latest 3 blog posts (title + date + reading time).
- 3–6 pinned GitHub projects (live, from `sanishchirayath1`).
- Contact strip:
  - email: `sanishchirayath@gmail.com`
  - GitHub: [`sanishchirayath1`](https://github.com/sanishchirayath1)
  - LinkedIn: [`sanishchirayath`](https://www.linkedin.com/in/sanishchirayath)
  - Twitter/X: [`@sanishch`](https://twitter.com/sanishch)
  - Leetcode: [`sanishchirayath`](https://leetcode.com/sanishchirayath)
  - RSS: `/rss.xml`
- All identity data sourced from `content/identity.yaml` (single source of truth).

### 6.2 Writing / Blog
- MDX-based posts stored in-repo under `content/writing/*.mdx`.
- Frontmatter: `title, date, tags, summary, draft`.
- Code blocks: syntax-highlighted at build (Shiki), line highlighting, copy button, filename label.
- Reading time, table of contents for long posts, previous/next.
- RSS 2.0 + JSON Feed.
- Tag pages: `/writing/tag/[tag]`.
- OG images generated at request time via edge (`@vercel/og`) — text-only, no photos, brand-consistent.

### 6.3 Work / Experience
- Data source: `content/experience.yaml` (single file, hand-curated).
- Fields: `company, role, start, end, location, scope, highlights[], stack[], links[]`.
- Rendered as a vertical timeline with keyboard navigation (`j/k` to step).
- Printable via `/resume`.
- Seeded with four roles (latest first): **Bruno** (Jan 2025 – present), **Rigi** (May 2024 – Dec 2024), **Learnapp** (Jul 2022 – Oct 2023), **XKern Technologies** (Jan 2022 – Jul 2022).

### 6.4 Projects (GitHub auto-sync — see §7)
- Data source: GitHub GraphQL API at runtime.
- Filter: repos with topic `portfolio` **or** pinned repos.
- Display: name, description, primary language, stars, last-commit-relative-time, topics.
- Optional per-repo override via `content/projects/[repo].md` for custom copy — merged with API data at render time. Missing override → API data only.
- Sort: last-updated desc, with pinned pinned to top.

### 6.5 Now page
- Manually updated via `content/now.mdx`.
- Auto-augmented block: "training week" — cycling km, swim km, sessions this week. Data source TBD (Strava dropped as it moved to paid access; Google Fit REST API is retired). Candidates: manual `content/training.yaml`, Fitbit, Polar. Fails silently if source is unavailable.

### 6.6 Uses page
- Static MDX. Hardware, editor, terminal, shell, dotfiles link.

### 6.7 Migration from `blogs.hstart.in`
- Two existing posts migrate to `content/writing/` as native MDX:
  - "Deploying a static website with AWS CDK: A Lazy Engineer's Guide" → `/writing/deploying-a-static-website-with-aws-cdk`
  - "Hosting a static website on AWS S3 with CI/CD" → `/writing/hosting-a-static-website-on-aws-s3-with-cicd`
- 301 redirects from `blogs.hstart.in/*` → `portfolio.hstart.in/writing/*` configured during M6 cutover (DNS/CDN layer + `next.config.mjs`).
- After migration, `blogs.hstart.in` is deprecated. `portfolio.hstart.in/writing` is the canonical writing home.

---

## 7. GitHub Auto-Sync — Functional Requirements

**Requirement:** New/updated GitHub projects appear on the site **without a rebuild or redeploy**.

### Approach
1. **Runtime fetch, edge-cached.** `/api/github/projects` is a serverless edge function that queries the GitHub GraphQL API for user `sanishchirayath1`, returns normalized JSON.
2. **Cache tier:** Edge cache with `stale-while-revalidate` (TTL 10 min, SWR 1 hr). Cache key includes the query.
3. **On-demand invalidation:** GitHub webhook (`push`, `repository`, `star`) → `/api/revalidate` → purges the edge cache tag. New repo visible in ≤ 30 seconds.
4. **Client behavior:** `/projects` and home's pinned-projects section fetch this endpoint at request time (server component on Next.js). No client-side spinner for the initial render; skeleton only on client-side refetch.
5. **Rate-limit safety:** Authenticated with a fine-grained PAT (read-only public repos + user metadata). 5000 req/hr ceiling — well above expected traffic.
6. **Fallback:** If the API fails, serve last-known-good cached JSON committed to the repo (`content/projects.snapshot.json`), refreshed nightly by a GitHub Action.

### Per-repo overrides
- Optional `content/projects/[repo].md` file with frontmatter:
  ```yaml
  ---
  headline: "A better description than the repo's"
  featured: true
  hidden: false
  writeup: "/writing/how-i-built-x"
  ---
  ```
- Merge rule: override wins over API data field-by-field.

---

## 7.5 Writing Syndication — Functional Requirements

**Requirement:** New posts published to the portfolio are cross-posted to dev.to with the portfolio URL as `canonical_url`. Edits sync too. No duplicates.

### Approach
1. **Trigger:** GitHub Action on push to `main` that touches `content/writing/**/*.mdx`.
2. **Diff detection:** Action compares against a `.syndication-lock.json` committed to the repo (maps `slug → { devto_id, content_hash }`).
3. **Publish rules:**
   - New slug → create on both platforms, capture returned IDs, commit updated lock file.
   - Existing slug, content hash changed → update via ID.
   - `draft: true` in frontmatter → skip.
   - `syndicate: false` in frontmatter → skip that post (per-post opt-out).
4. **Canonical URL:** Every syndicated copy sets `canonical_url: https://portfolio.hstart.in/writing/{slug}`.
5. **Content transform:** Strip MDX-specific components (custom React blocks). Fall back to plain markdown equivalents. Log a warning on unsupported components.
6. **Idempotent:** Rerunnable with no side effects if nothing changed.
7. **Failure isolation:** Syndication failure never blocks the site deploy. Status posted as PR/commit comment.

---

## 8. Surprising Elements

Selected — not all shipped in v1. Each earns its place by being ≤ 1 day of work and undo-able.

**v1 (must-have):**
1. **⌘K command palette.** Fuzzy-search posts, projects, pages, and actions (`copy email`, `download résumé`, `toggle theme`).
2. **Boot sequence.** First-visit only: 400ms typewriter print of a short `whoami`-style intro, then reveal. Skippable with any key. `prefers-reduced-motion` disables it.
3. **`curl portfolio.hstart.in`** returns a plaintext, colored (ANSI) résumé. Content-negotiated on `User-Agent` / `Accept`.
4. **Konami code** → toggles a "verbose" mode that shows file paths, commit SHAs, and build metadata next to every section. Persists to localStorage.
5. **ASCII sparkline** for GitHub commit activity (last 52 weeks) — rendered as text, no SVG. (Training-load sparkline deferred to v1.1 pending training data source; see §7.4.)
6. **Reading progress as scroll-bar** rendered in the browser tab title: `[████░░░░] Post title`.

**v1.1 (nice-to-have):**
7. **Live status dot** next to name — green if I've committed in the last 24h, amber if 24–72h, grey otherwise.
8. **"Ambient market" strip** at the very bottom, tiny, muted: NIFTY / BTC / one ticker I follow. Updated every 5 min via edge fetch.
9. **Guest log** — sign with your GitHub handle, appears as an append-only text file `/guests.txt`. Backed by a tiny KV store, rate-limited.
10. **`/whoami` route** — Unix-manual-styled page describing me in `man` format.

**Explicitly deferred:**
- Playable in-terminal game (fun but a rabbit hole).
- Chatbot / RAG-over-my-writing (overdone in 2026).

---

## 9. Personality Signals — Coding, Finance, Sports

Woven in, not siloed:

- **Coding:** command palette, verbose mode, `curl` responses, code snippets in posts.
- **Finance:** ambient market strip, one blog category `notes/finance`, `/uses` mentions the data tools I use.
- **Sports:** `/now` page shows a small "training log" block (this week's swim km + cycling km + calisthenics sessions). Data source TBD — see §7.4. Training-load sparkline deferred to v1.1. No screenshots, no GPX maps.

---

## 10. Non-functional Requirements

| Area | Target |
|---|---|
| Lighthouse Performance | ≥ 98 mobile |
| LCP (4G, mid-tier phone) | < 1.0s |
| CLS | < 0.02 |
| Total JS on home | < 40 KB gzipped |
| Accessibility | WCAG 2.2 AA. Keyboard-complete. Screen-reader tested. |
| SEO | Semantic HTML, sitemap, OG tags, JSON-LD (`Person`, `BlogPosting`) |
| Privacy | No third-party analytics with cookies. Plausible or self-hosted Umami. |
| Uptime | 99.9% (Vercel-class hosting) |
| Browser support | Latest 2 versions of Chrome/Safari/Firefox/Edge. Graceful degradation elsewhere. |
| No-JS | Core content (writing, work, contact) fully readable. |

---

## 11. Constraints

- **No images anywhere.** Icons via inline SVG only, monochrome, ≤ 1 KB each. OG images are text-generated at edge.
- **No paid dependencies for v1.**
- **Domain:** keep `portfolio.hstart.in`. Zero-downtime cutover.
- **Solo build.** Time budget: ~4 weekends.

---

## 12. Milestones

| M | Scope | Exit criteria |
|---|---|---|
| M0 | Repo scaffolding, design tokens, typography system, deploy pipeline | Blank page live on preview URL, Lighthouse ≥ 98 |
| M1 | Home + Work + Uses + Now (static content only) | Personal content live, no images, keyboard nav works |
| M2 | Writing (MDX pipeline, RSS, tag pages, OG generator) | First post published, feed validates |
| M3 | GitHub auto-sync (edge endpoint, webhook, override system, snapshot fallback) | New repo appears within 30s of push, no rebuild triggered |
| M4 | Surprise elements v1 (palette, boot, curl, Konami, sparklines, tab progress) | All six work; reduced-motion respected |
| M5 | Training data source (TBD), market strip, guest log | Optional. Ship if time |
| M6 | Cutover — DNS switch, redirects from v1 URLs | v1 URLs 301 to v2 equivalents |

---

## 13. Resolved Decisions

1. **Theme:** System preference by default, manual toggle to override. Both light and dark polished.
2. **Writing canonical source:** Portfolio is canonical. Posts written as MDX in this repo. Syndicated to dev.to via its API on publish, with `canonical_url` pointing back to the portfolio. See §7.5.
3. **Secrets:** Read-only tokens (GitHub PAT, dev.to API key) stored in Vercel env vars. Rotated annually.
4. **Comments:** None on portfolio. Discussion happens on syndicated copies (dev.to / X).
5. **Newsletter:** Deferred to v1.1. Not in v1 scope.
6. **Existing blog domain:** `blogs.hstart.in` deprecated. Two existing posts migrate to `content/writing/`. 301 redirects wired at DNS/CDN + `next.config.mjs` during M6 cutover.
7. **GitHub handle:** `sanishchirayath1` (from resume). All GraphQL queries, sitemap references, and OG cards point here.

---

## 14. Success Metrics (90 days post-launch)

- Time-to-first-meaningful-paint (RUM p75) < 1.2s
- ≥ 3 unsolicited mentions on X / LinkedIn / HN about the site itself
- ≥ 1 blog post ships per month
- Zero manual deploys triggered for project updates (validate auto-sync works in practice)
- Print of `/resume` is legible on A4 without CSS tweaks

---
