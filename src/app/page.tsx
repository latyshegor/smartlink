import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const links = await prisma.smartLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { _count: { select: { clicks: true } } },
  });

  return (
    <div className="admin-surface min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">
          ◆ SmartLink
        </span>
        <h1
          className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          One link.
          <br />
          Every platform.
        </h1>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/60">
          Smart links for music artists. Drop one URL everywhere — fans land on a
          page that sends them to their platform, and you see exactly where they go.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin"
            className="rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Open admin
          </Link>
          {links[0] && (
            <Link
              href={`/${links[0].slug}`}
              className="rounded-full border border-white/20 px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            >
              View a demo page
            </Link>
          )}
        </div>

        {links.length > 0 && (
          <div className="mt-16 w-full">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Live pages
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <Link
                  key={l.id}
                  href={`/${l.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.07]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.coverUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{l.title}</p>
                    <p className="truncate text-[12px] text-white/50">{l.artistName}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-white/40">
                    {l._count.clicks} clicks
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
