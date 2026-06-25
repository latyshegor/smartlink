import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DSP_MAP, dspLabel, dspColor } from "@/lib/dsp";

export const dynamic = "force-dynamic";

export default async function Stats({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await requireArtist();
  const link = await prisma.smartLink.findFirst({
    where: { id, artistId: artist.id },
    include: { clicks: true, preSaves: true },
  });
  if (!link) notFound();

  const total = link.clicks.length;
  const preSaves = link.preSaves.length;

  // Per-DSP aggregation.
  const byDsp = new Map<string, number>();
  for (const c of link.clicks) byDsp.set(c.dsp, (byDsp.get(c.dsp) ?? 0) + 1);
  const rows = [...byDsp.entries()]
    .map(([dsp, count]) => ({ dsp, count }))
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const top = rows[0];

  // Last 14 days trend.
  const days: { label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = link.clicks.filter(
      (c) => c.createdAt.toISOString().slice(0, 10) === key,
    ).length;
    days.push({ label: String(d.getDate()), count });
  }
  const dayMax = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/links" className="text-[13px] text-white/40 hover:text-white">
            ← Back to links
          </Link>
          <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {link.title}
          </h1>
          <a href={`/${link.slug}`} target="_blank" rel="noopener" className="text-[13px] text-indigo-300 hover:underline">
            /{link.slug} ↗
          </a>
        </div>
        <Link href={`/admin/links/${link.id}/edit`} className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold hover:bg-white/10">
          Edit page
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Total clicks" value={total} />
        <Kpi label="Spotify pre-saves" value={preSaves} />
        <Kpi label="Top platform" value={top ? dspLabel(top.dsp) : "—"} small />
      </div>

      {/* Per-DSP breakdown */}
      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white/50">
          Clicks by platform
        </h2>
        {rows.length === 0 ? (
          <p className="text-[14px] text-white/40">No clicks yet. Share your link to start tracking.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((r) => {
              const pct = total ? Math.round((r.count / total) * 100) : 0;
              return (
                <div key={r.dsp} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[14px] font-semibold">{DSP_MAP[r.dsp]?.label ?? r.dsp}</span>
                  <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
                    <div
                      className="flex h-full items-center justify-end rounded-lg px-2 text-[12px] font-bold text-black/80 transition-all"
                      style={{ width: `${(r.count / max) * 100}%`, background: dspColor(r.dsp), minWidth: 28 }}
                    >
                      {r.count}
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-[13px] text-white/50">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Daily trend */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white/50">
          Last 14 days
        </h2>
        <div className="flex h-36 items-end gap-1.5">
          {days.map((d, i) => (
            <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] text-white/40">{d.count || ""}</span>
              <div
                className="w-full rounded-t bg-indigo-400/80 transition-all group-hover:bg-indigo-300"
                style={{ height: `${(d.count / dayMax) * 100}%`, minHeight: d.count ? 4 : 2, opacity: d.count ? 1 : 0.25 }}
              />
              <span className="text-[9px] text-white/30">{d.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className={`font-bold ${small ? "text-[18px]" : "text-[28px]"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      <p className="mt-1 text-[12px] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}
