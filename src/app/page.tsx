import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo, LogoMark } from "@/components/Logo";
import { HeroDots } from "@/components/HeroDots";

export const dynamic = "force-dynamic";

export default async function Home() {
  const links = await prisma.smartLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { _count: { select: { clicks: true } } },
  });

  return (
    <div className="admin-surface min-h-screen">
      {/* Interactive glowing-dots background */}
      <HeroDots />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size={24} textClass="text-[17px]" />
        <Link
          href="/admin"
          className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center pt-24 text-center sm:pt-32">
          <h1
            className="sl-rise max-w-3xl text-[44px] font-bold leading-[0.98] tracking-[-0.03em] sm:text-[76px]"
            style={{ fontFamily: "var(--font-display)", animationDelay: "60ms" }}
          >
            One link.
            <br />
            <span className="lh-accent-text">Every platform.</span>
          </h1>
          <p
            className="sl-rise mt-6 max-w-lg text-[17px] leading-relaxed text-white/55"
            style={{ animationDelay: "120ms" }}
          >
            Build a beautiful smart link for your release. Fans tap through to their
            platform of choice, and you see exactly where every click goes.
          </p>

          <div className="sl-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
            <Link
              href="/admin"
              className="lh-glow rounded-full px-8 py-4 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--lh-accent)", color: "var(--lh-ink)" }}
            >
              Create your link — free
            </Link>
            {links[0] && (
              <Link
                href={`/${links[0].slug}`}
                className="rounded-full border border-white/18 px-8 py-4 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
              >
                See a live page ↗
              </Link>
            )}
          </div>

          {/* Feature row */}
          <div className="sl-rise mt-16 grid w-full max-w-3xl gap-3 sm:grid-cols-3" style={{ animationDelay: "240ms" }}>
            {[
              { t: "5+ platforms", d: "Spotify, Apple, YouTube, Amazon, Deezer" },
              { t: "Real analytics", d: "Per-platform clicks, live" },
              { t: "Your design", d: "Theme builder + custom backgrounds" },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 text-left">
                <LogoMark size={18} />
                <p className="mt-3 text-[15px] font-bold">{f.t}</p>
                <p className="mt-1 text-[13px] leading-snug text-white/45">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live pages */}
        {links.length > 0 && (
          <section className="mt-24 pb-24">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Pages built with Linkhub
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l) => (
                <Link
                  key={l.id}
                  href={`/${l.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.06]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.coverUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{l.title}</p>
                    <p className="truncate text-[12px] text-white/45">{l.artistName}</p>
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-white/35">
                    {l._count.clicks} ▸
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-[13px] text-white/40">
          <Logo size={18} textClass="text-[14px]" />
          <span>One link for every platform.</span>
        </div>
      </footer>
    </div>
  );
}
