# SmartLink — smart links for music artists

One link, every platform. An artist creates a single page for a track or release;
fans land on it and tap through to their platform of choice (Spotify, Apple Music,
YouTube Music, Amazon Music, Deezer). Every tap is tracked per platform in a real
database, and there's a real Spotify **pre-save** flow on top.

In the direction of Hypeddit / feature.fm — built as a working MVP.

**Live demo:** https://smartlink-beta.vercel.app
**Demo pages:** [`/midnight-drive`](https://smartlink-beta.vercel.app/midnight-drive) · [`/golden-hour`](https://smartlink-beta.vercel.app/golden-hour)
**Admin:** [`/admin`](https://smartlink-beta.vercel.app/admin) — `artist@smartlink.app` / `demo1234`

---

## What it does

- **Public smart-link page** (`/[slug]`) — cover-driven, mobile-first artist page
  listing the track across major DSPs. Designed to feel like a real music product,
  not a default template.
- **Per-platform click tracking** — every DSP button routes through `/api/go/[id]`,
  which writes a real `Click` row and then 302-redirects to the DSP. Nothing is
  mocked; the clicks you make are stored and counted.
- **Spotify pre-save (real OAuth)** — the "Save on Spotify" button runs the real
  Spotify OAuth flow, stores the user's tokens in a `PreSave` row, and saves the
  track straight to their library. *(The Spotify app is in development mode, so to
  actually complete a save your Spotify account must be on the app's allow-list —
  see "Trying the pre-save" below.)*
- **Admin** (`/admin`) — password login, create/edit pages, and a per-platform
  click dashboard with a 14-day trend.
- **Theme constructor** (the surprise feature) — instead of fixed templates, each
  artist *builds* their page look: background (cover-blur / gradient / solid),
  font, accent colour (auto-extracted from the cover art), button style and corner
  radius — with a **live phone preview** that updates as you type.
- **Custom slug** per link, plus a **QR code** of the page for promo (flyers, stories).

## Stack & why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, TS) | One codebase for the public pages, admin and API routes; server components keep the public page fast and SEO-friendly. |
| DB | **Postgres** (local dev → **Supabase** in prod) | Real relational data — links, platforms, clicks, pre-saves. |
| ORM | **Prisma 6** | Type-safe queries + migrations. (Pinned to 6 — 7 moved config to a new file mid-release; 6 is the stable production choice.) |
| Styling | **Tailwind v4** | Fast, consistent, themeable via CSS variables. |
| Auth | **iron-session** + bcrypt | Simple stateless cookie session for the admin. |
| Pre-save | **Spotify Web API** (OAuth) | Real authorization-code flow, real library save. |
| Extras | node-vibrant (accent from cover), qrcode (promo QR) | |
| Hosting | **Vercel** + Supabase | |

Single seeded admin account (the brief asked for a *simple* admin); the schema is
already multi-artist ready (`Artist` owns many `SmartLink`s).

## Data model

`Artist` → many `SmartLink` → many `PlatformLink` (one per DSP), many `Click`
(per-platform events), many `PreSave` (Spotify tokens). Theme is stored as a
`themeConfig` JSON blob on each `SmartLink`. See `prisma/schema.prisma`.

## Run locally

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
#    - set DATABASE_URL / DIRECT_URL to a Postgres instance
#    - set SESSION_SECRET (openssl rand -hex 32)
#    - (optional) SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET for pre-save

# 3. Migrate + seed (creates the demo admin + two demo pages with real clicks)
npx prisma migrate dev
npx prisma db seed

# 4. Dev
npm run dev          # http://localhost:3000
```

Demo pages after seeding: `/midnight-drive`, `/golden-hour`.
Admin: `/admin` → `artist@smartlink.app` / `demo1234`.

### Spotify pre-save setup

1. Create an app at <https://developer.spotify.com/dashboard> (instant, no review
   needed for development mode — up to 25 whitelisted test users).
2. Add `<NEXT_PUBLIC_BASE_URL>/api/spotify/callback` to the app's **Redirect URIs**.
3. Put the client id/secret in `.env`. Without them, the pre-save button degrades
   gracefully (shows a "not configured" notice instead of erroring).

### Trying the pre-save on the live demo

The live deployment already has a Spotify app wired up. Spotify keeps new apps in
**development mode**, which only lets allow-listed Spotify accounts complete the
flow (up to 25). To try it end-to-end, send me the email on your Spotify account
and I'll add it (Spotify Dashboard → app → **User Management**), or I can record a
quick clip of the real save. Clicking "Save on Spotify" always reaches the genuine
Spotify authorization screen — the allow-list only gates the final consent.

## Project layout

```
src/
  app/
    [slug]/page.tsx              # public smart-link page
    api/go/[id]/route.ts         # click tracker -> 302 to DSP
    api/spotify/{login,callback} # real OAuth pre-save
    admin/                       # login, links list, editor, stats
  components/
    SmartLinkView.tsx            # the artist page (shared: public + live preview)
    admin/LinkEditor.tsx         # theme constructor + live phone preview
  lib/                           # prisma, session, auth, dsp, theme, spotify, slug
prisma/schema.prisma + seed.ts
```

## What I'd build next with more time

- **Multi-artist signup** + per-artist dashboards (schema already supports it).
- **Pre-save on release day** — a scheduled job that uses the stored refresh tokens
  to add the track to every pre-saver's library the moment the release goes live
  (the current flow saves immediately, which is the right demo of the integration).
- **More pre-save targets** — Apple Music (MusicKit) and Deezer.
- **Richer analytics** — geo/referrer breakdown, unique vs total, conversion rate
  (clicks -> pre-saves), CSV export.
- **Auto-fetch metadata** — paste one Spotify/Apple link and auto-pull title, cover
  and the matching links on the other DSPs.
- **Custom domains** + A/B page variants.

## Notes on scope

Per the brief, I optimised for "works end-to-end at a small scope" over a
half-built large scope. Everything you click is backed by Postgres — click a few
DSP buttons and watch the numbers move in the admin stats.
