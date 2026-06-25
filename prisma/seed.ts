import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { THEME_PRESETS } from "../src/lib/theme";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "artist@smartlink.app";
  const password = process.env.ADMIN_PASSWORD ?? "demo1234";
  const passwordHash = await bcrypt.hash(password, 10);

  const artist = await prisma.artist.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Demo Label", passwordHash },
  });

  // Wipe demo links so re-seeding is idempotent.
  await prisma.smartLink.deleteMany({ where: { artistId: artist.id } });

  const links = [
    {
      slug: "midnight-drive",
      title: "Midnight Drive",
      artistName: "NOVA",
      coverUrl: "https://picsum.photos/seed/midnightdrive/800/800",
      theme: THEME_PRESETS[0].config,
      platforms: [
        { dsp: "spotify", url: "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl" },
        { dsp: "apple", url: "https://music.apple.com/us/album/1440857781" },
        { dsp: "youtube", url: "https://music.youtube.com/watch?v=dQw4w9WgXcQ" },
        { dsp: "amazon", url: "https://music.amazon.com/albums/B07PXGQC1Q" },
        { dsp: "deezer", url: "https://www.deezer.com/track/3135556" },
      ],
    },
    {
      slug: "golden-hour",
      title: "Golden Hour",
      artistName: "Mara Vель",
      coverUrl: "https://picsum.photos/seed/goldenhour/800/800",
      theme: THEME_PRESETS[3].config,
      platforms: [
        { dsp: "spotify", url: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b" },
        { dsp: "apple", url: "https://music.apple.com/us/album/1530035690" },
        { dsp: "youtube", url: "https://music.youtube.com/watch?v=09R8_2nJtjg" },
        { dsp: "deezer", url: "https://www.deezer.com/track/916424" },
      ],
    },
  ];

  for (const l of links) {
    const link = await prisma.smartLink.create({
      data: {
        slug: l.slug,
        title: l.title,
        artistName: l.artistName,
        coverUrl: l.coverUrl,
        themeConfig: l.theme as object,
        artistId: artist.id,
        platforms: {
          create: l.platforms.map((p, i) => ({ dsp: p.dsp, url: p.url, position: i })),
        },
      },
    });

    // Seed a few real click rows so the stats dashboard isn't empty.
    const sample: { dsp: string; n: number }[] = [
      { dsp: "spotify", n: 14 },
      { dsp: "apple", n: 6 },
      { dsp: "youtube", n: 9 },
      { dsp: "amazon", n: 2 },
      { dsp: "deezer", n: 3 },
    ];
    const clicks = sample.flatMap((s) =>
      Array.from({ length: s.n }, () => ({
        dsp: s.dsp,
        smartLinkId: link.id,
        userAgent: "seed",
      })),
    );
    if (clicks.length) await prisma.click.createMany({ data: clicks });
  }

  console.log(`Seeded artist ${artist.email} (password: ${password}) + ${links.length} links`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
