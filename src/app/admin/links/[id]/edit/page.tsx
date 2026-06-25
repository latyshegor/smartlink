import Link from "next/link";
import { notFound } from "next/navigation";
import { requireArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinkEditor } from "@/components/admin/LinkEditor";
import { normalizeTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function EditLink({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await requireArtist();
  const link = await prisma.smartLink.findFirst({
    where: { id, artistId: artist.id },
    include: { platforms: true },
  });
  if (!link) notFound();

  const platforms: Record<string, string> = {};
  for (const p of link.platforms) platforms[p.dsp] = p.url;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/links" className="text-[13px] text-white/40 hover:text-white">
          ← Back to links
        </Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Edit “{link.title}”
        </h1>
      </div>
      <LinkEditor
        initial={{
          id: link.id,
          title: link.title,
          artistName: link.artistName,
          coverUrl: link.coverUrl,
          slug: link.slug,
          releaseDate: link.releaseDate ? link.releaseDate.toISOString().slice(0, 10) : "",
          theme: normalizeTheme(link.themeConfig),
          platforms,
        }}
      />
    </div>
  );
}
