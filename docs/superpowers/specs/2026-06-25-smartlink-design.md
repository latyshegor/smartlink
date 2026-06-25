# Smart Link Platform — Design Spec

**Date:** 2026-06-25
**Goal:** Working MVP of a smart link platform for music artists (direction of Hypeddit / feature.fm). Trial task, deadline Mon 29.06.

## Outcome
Artist creates a polished, mobile-first smart link page for a track/release. Page lists the track across major DSPs (Spotify, Apple Music, YouTube Music, Amazon Music, Deezer). Visitors pick a DSP; the click is tracked per platform in a real database. Optional Spotify pre-save via real OAuth. A simple admin lets the artist create/edit pages (with a theme constructor) and view click data.

## Verification criteria
- Public page renders for a slug, mobile-responsive, on-brand (not a default template).
- Each DSP click writes a real `Click` row, then 302-redirects to the DSP.
- Spotify pre-save runs a real OAuth flow and stores a `PreSave` row + saves the track.
- Admin: login, create/edit link, pick/customize theme, view per-DSP click counts.
- Live deployed URL + GitHub repo + README. Data is real (Postgres), not mocked.

## Stack
- Next.js 15 (App Router, TS), React 19
- Tailwind v4
- Prisma 6 (stable) + Postgres (local dev → Supabase prod)
- iron-session (admin auth, bcrypt password), Spotify Web API (real OAuth)
- node-vibrant (accent color from cover), qrcode (promo QR)
- Deploy: Vercel + Supabase

## Data model
`Artist` (seeded admin, multi-artist ready) · `SmartLink` (slug, title, cover, themeConfig JSON, releaseDate) · `PlatformLink` (dsp, url) · `Click` (dsp, ts, UA, isPreSave) · `PreSave` (spotifyUserId, tokens, saved).

## Routes
| Route | Purpose |
|---|---|
| `/[slug]` | Public artist page (cover hero, DSP buttons, pre-save, theme applied) |
| `/api/go/[id]` | Click tracker → write Click → 302 to DSP |
| `/api/spotify/login` + `/callback` | Real Spotify OAuth pre-save |
| `/admin` | Artist login |
| `/admin/links` | List + click summary |
| `/admin/links/new`, `/[id]/edit` | Create/edit + theme constructor (live phone preview) |
| `/admin/links/[id]/stats` | Per-DSP click dashboard + chart |

## Surprise feature — Theme constructor
Artist customizes their page: background (solid / gradient / cover-blur), font, accent color (auto-extracted from cover as default), button style (glass / solid / outline), corner radius. Stored as `themeConfig` JSON, rendered via CSS variables. Live phone preview while editing. Plus a QR code of the page for promo.

## Scope decisions
- Single seeded admin account (ТЗ asks "simple admin"). Schema multi-artist ready.
- Pre-save: real Spotify OAuth (dev creds instant, dev-mode whitelist up to 25 users).
- Custom slug (stretch) included.

## Stability Checklist
- ☑ Plan mode / brainstorm used (design approved by Egor)
- ☑ Spec written and approved
- ☑ Worktree decision: solo build in fresh repo, not needed
- ☐ Red-first: N/A new build; QA via Playwright instead
- ☐ codex/adversarial-review before deploy
- ☐ review-loop on done
- ☐ Smoke test: live URL renders page + click writes DB row (semantic, not 200 OK)
- ☐ Rollback: Vercel keeps prior deploy; `vercel rollback` reverts in one step

## What's next (more time)
Multi-artist signup, real pre-save scheduler (save on release day via stored refresh token + cron), Apple Music / Deezer pre-save, geo analytics + referrers, A/B page variants, custom domains.
