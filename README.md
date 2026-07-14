# portfolio

Sanish Chirayath's personal site. Terminal-forward, text-only, keyboard-native.

**Live:** [portfolio.hstart.in](https://portfolio.hstart.in) (v1 during v2 build)
**Docs:** [PRD](./PRD.md) · [Implementation Plan](./PLAN.md)

---

## Stack

Next.js 15 · TypeScript strict · Tailwind v4 · Biome · MDX (M2) · Vercel edge.

## Dev

```sh
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome check
pnpm build          # production build
```

Node 20+ required. See `.env.example` for environment variables.

## Structure

- `app/` — App Router pages and API routes.
- `content/` — MDX writing, YAML data (experience, identity).
- `lib/` — shared modules (fonts, github, mdx, plaintext).
- `components/` — UI primitives (palette, boot, sparkline, layout).

See [PLAN.md §2](./PLAN.md) for the full layout.

## Milestones

- **M0** — Scaffold ✅
- M1 — Content pages
- M2 — Writing pipeline
- M3 — GitHub auto-sync
- M4 — Surprise elements
- M5 — Syndication (dev.to)
- M6 — Cutover
