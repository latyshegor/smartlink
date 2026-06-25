"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireArtist } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { normalizeTheme } from "@/lib/theme";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const artist = await prisma.artist.findUnique({ where: { email } });
  if (!artist || !(await bcrypt.compare(password, artist.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.artistId = artist.id;
  session.email = artist.email;
  await session.save();
  redirect("/admin/links");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin");
}

interface PlatformInput {
  dsp: string;
  url: string;
}

interface SaveLinkInput {
  id?: string;
  title: string;
  artistName: string;
  coverUrl: string;
  slug: string;
  releaseDate?: string | null;
  themeConfig: unknown;
  platforms: PlatformInput[];
}

// Create or update a smart link owned by the logged-in artist.
export async function saveLink(input: SaveLinkInput) {
  const artist = await requireArtist();

  const title = input.title.trim();
  const artistName = input.artistName.trim();
  const coverUrl = input.coverUrl.trim();
  if (!title || !artistName || !coverUrl) {
    return { error: "Title, artist name and cover image are required." };
  }

  let slug = slugify(input.slug || title);
  if (!slug) slug = `link-${Date.now()}`;

  // Ensure slug uniqueness (ignore the row being edited).
  const clash = await prisma.smartLink.findFirst({
    where: { slug, NOT: input.id ? { id: input.id } : undefined },
  });
  if (clash) return { error: `Slug "${slug}" is already taken — pick another.` };

  const platforms = input.platforms
    .map((p) => ({ dsp: p.dsp, url: p.url.trim() }))
    .filter((p) => p.url.length > 0);
  if (platforms.length === 0) {
    return { error: "Add at least one platform link." };
  }

  const theme = normalizeTheme(input.themeConfig) as unknown as object;
  const releaseDate = input.releaseDate ? new Date(input.releaseDate) : null;

  let linkId = input.id;
  if (input.id) {
    const existing = await prisma.smartLink.findFirst({
      where: { id: input.id, artistId: artist.id },
    });
    if (!existing) return { error: "Link not found." };
    await prisma.$transaction([
      prisma.smartLink.update({
        where: { id: input.id },
        data: { title, artistName, coverUrl, slug, releaseDate, themeConfig: theme },
      }),
      prisma.platformLink.deleteMany({ where: { smartLinkId: input.id } }),
      prisma.platformLink.createMany({
        data: platforms.map((p, i) => ({
          smartLinkId: input.id!,
          dsp: p.dsp,
          url: p.url,
          position: i,
        })),
      }),
    ]);
  } else {
    const created = await prisma.smartLink.create({
      data: {
        title,
        artistName,
        coverUrl,
        slug,
        releaseDate,
        themeConfig: theme,
        artistId: artist.id,
        platforms: {
          create: platforms.map((p, i) => ({ dsp: p.dsp, url: p.url, position: i })),
        },
      },
    });
    linkId = created.id;
  }

  revalidatePath("/admin/links");
  revalidatePath(`/${slug}`);
  return { ok: true, slug, id: linkId };
}

// Extract a dominant accent color from a cover image URL (theme helper).
export async function extractAccent(coverUrl: string): Promise<{ accent?: string; error?: string }> {
  try {
    await requireArtist();
    const res = await fetch(coverUrl);
    if (!res.ok) return { error: "Could not load image" };
    const buf = Buffer.from(await res.arrayBuffer());
    const { Vibrant } = await import("node-vibrant/node");
    const palette = await Vibrant.from(buf).getPalette();
    const swatch =
      palette.Vibrant ?? palette.LightVibrant ?? palette.Muted ?? palette.DarkVibrant;
    if (!swatch) return { error: "No color found" };
    return { accent: swatch.hex };
  } catch (err) {
    console.error("extractAccent failed", err);
    return { error: "Extraction failed" };
  }
}

export async function deleteLink(id: string) {
  const artist = await requireArtist();
  await prisma.smartLink.deleteMany({ where: { id, artistId: artist.id } });
  revalidatePath("/admin/links");
  return { ok: true };
}
