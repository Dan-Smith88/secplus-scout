# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Stack

- **Next.js 16.2.3** with App Router — see AGENTS.md note about breaking changes
- **React 19**, **TypeScript 5**, **Tailwind CSS v4** (PostCSS plugin, not the v3 config file)
- **Lucide React** for icons, **Framer Motion** available but not yet used in pages
- No backend, database, or auth — all state lives in `localStorage`

## Architecture

**All content is static data in `lib/securityData.ts`.** It exports `domains: Domain[]`, where each domain contains `acronyms: Acronym[]`. Every page derives its content by importing this file directly — there are no API routes or data-fetching calls.

**Two localStorage namespaces track user progress:**
- `secplus-domain-progress-v1` — quiz scores per domain (`{ percent, correct, total, completedAt }`)
- `secplus-acronym-mastery-v1` — flashcard tracking per `domainCode:acronym` key (`MasteryRecord`)

`lib/masteryStorage.ts` owns all read/write to the mastery store (`loadMastery`, `saveMastery`, `upsertMasteryResult`). The domain progress store is written inline in `app/quiz/domain/page.tsx` on quiz submit.

**Pages are almost all client components** (`"use client"`). The exception is `app/study/[code]/page.tsx`, which is a server component that uses `async params` — the Next.js 16 pattern for dynamic route params is `params: Promise<{ code: string }>` resolved with `await params`.

## Route Map

| Route | Purpose |
|---|---|
| `/` | Dashboard — weighted readiness, domain progress, stat cards |
| `/quiz` | Scope selector (all domains vs. single domain) |
| `/quiz/domain?code=<code\|all>` | Quiz engine — `code=all` runs a random 15-item mixed quiz |
| `/mastery` | Mastery hub — links to sub-modes, shows recent misses |
| `/mastery/daily` | Daily drill — 10 cards, priority-weighted by mastery state |
| `/mastery/missed` | Review only last-missed terms |
| `/mastery/confusion` | Confusion pairs study mode |
| `/mastery/all` | Full acronym glossary |
| `/search` | Client-side acronym search across all domains |
| `/study/[code]` | Domain study page — acronym list + links to quiz/flashcards |
| `/study/[code]/flashcards` | Flashcard mode for a single domain |

## Key Conventions

- **Item keys** for mastery records are `domainCode:acronym` (e.g. `"1.0:CIA"`). Use `makeKey()` from `lib/masteryStorage.ts` to generate them consistently.
- **Quiz choices** are shuffled on mount and stored in component state to avoid re-shuffling on re-render. Shuffle happens in `useEffect` after mount, never on the server.
- **`mounted` guard pattern** is used on every page that reads localStorage to prevent SSR/hydration mismatches — render a loading state until the first `useEffect` fires.
- **Domain lookup** accepts both `code` (e.g. `"1.0"`) and `slug` (e.g. `"general-security-concepts"`) for flexibility.
- All UI uses a dark navy/slate color palette (`#07111f`, `#0b1730`, `slate-950`) with `cyan-400` as the primary accent. Maintain this palette when adding new UI.
