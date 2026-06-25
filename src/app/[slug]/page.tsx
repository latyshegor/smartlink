import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { normalizeTheme } from "@/lib/theme";
import { SmartLinkView } from "@/components/SmartLinkView";
import { PreSaveToast } from "@/components/PreSaveToast";

export const dynamic = "force-dynamic";

async function getLink(slug: string) {
  return prisma.smartLink.findUnique({
    where: { slug },
    include: { platforms: { orderBy: { position: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLink(slug);
  if (!link) return { title: "Not found" };
  const title = `${link.title} — ${link.artistName}`;
  return {
    title,
    description: `Listen to ${link.title} by ${link.artistName} on every platform.`,
    openGraph: { title, images: [link.coverUrl] },
    twitter: { card: "summary_large_image", title, images: [link.coverUrl] },
  };
}

export default async function SmartLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ presave?: string }>;
}) {
  const { slug } = await params;
  const { presave } = await searchParams;
  const link = await getLink(slug);
  if (!link) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <PreSaveToast status={presave} />
      <SmartLinkView
        link={{
          slug: link.slug,
          title: link.title,
          artistName: link.artistName,
          coverUrl: link.coverUrl,
          releaseDate: link.releaseDate,
        }}
        platforms={link.platforms.map((p) => ({ id: p.id, dsp: p.dsp, url: p.url }))}
        theme={normalizeTheme(link.themeConfig)}
      />
    </div>
  );
}
