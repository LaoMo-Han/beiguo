# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
pnpm dev          # Next.js dev server
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
```

## Architecture

This is a **static Next.js 16 App Router** site with no database. All content lives in JSON files under `data/`.

**Content layer** — `src/lib/content.ts` imports all JSON files, defines TypeScript types (`Post`, `ModuleEntry`, `ModuleDetail`, `Character`, `Event`), and exports typed arrays + lookup helpers (`getPost`, `getModule`, `getModuleDetail`). Content changes happen by editing the JSON files in `data/`.

**Routing** — Three page routes:
- `/` — Home/discover feed (`src/app/page.tsx`)
- `/posts/[slug]` — Post detail (`src/app/posts/[slug]/page.tsx`)
- `/modules/[slug]` — Module detail with sections rendered by kind (`table` | `cards` | `checklist`) (`src/app/modules/[slug]/page.tsx`)
- `/data` — Data hub page listing characters, events, module overview (`src/app/data/page.tsx`)

Both `posts/[slug]` and `modules/[slug]` use `generateStaticParams` for full static generation.

**Components** — `BrowserShell` wraps every page with the site chrome (brand, search bar, nav). `PostCard` renders post previews with `tone-*` and `card-*` CSS classes.

**Path alias** — `@/*` maps to `src/*`.

**Styling** — Single global CSS file (`src/app/globals.css`) using CSS custom properties for theming (`--tone-cyan`, `--tone-pink`, etc.) and component-oriented class naming (`.module-card`, `.post-detail`, `.data-table`, etc.).

**Deployment** — Vercel project `exoring`, detected automatically from Next.js framework.
