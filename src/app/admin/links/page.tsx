import Link from "next/link";
import { requireArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LinksList() {
  const artist = await requireArtist();
  const links = await prisma.smartLink.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks: true, preSaves: true, platforms: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Your links
          </h1>
          <p className="mt-1 text-[14px] text-white/45">
            {links.length} {links.length === 1 ? "page" : "pages"}
          </p>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <p className="text-white/60">No smart links yet.</p>
          <Link
            href="/admin/links/new"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-[14px] font-bold text-black"
          >
            Create your first link
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {links.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.coverUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">{l.title}</p>
                <p className="truncate text-[13px] text-white/45">{l.artistName}</p>
                <a
                  href={`/${l.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-0.5 inline-block truncate text-[12px] text-indigo-300 hover:underline"
                >
                  /{l.slug} ↗
                </a>
              </div>
              <div className="flex items-center gap-5 text-center">
                <div>
                  <p className="text-[18px] font-bold">{l._count.clicks}</p>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">clicks</p>
                </div>
                <div>
                  <p className="text-[18px] font-bold">{l._count.preSaves}</p>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">saves</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/links/${l.id}/stats`}
                  className="rounded-lg border border-white/15 px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-white/10"
                >
                  Stats
                </Link>
                <Link
                  href={`/admin/links/${l.id}/edit`}
                  className="rounded-lg border border-white/15 px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-white/10"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
