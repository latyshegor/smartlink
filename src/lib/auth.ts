import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./prisma";

// Require an authenticated artist; redirect to login otherwise.
export async function requireArtist() {
  const session = await getSession();
  if (!session.artistId) redirect("/admin");
  const artist = await prisma.artist.findUnique({ where: { id: session.artistId } });
  if (!artist) redirect("/admin");
  return artist;
}
