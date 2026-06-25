import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  exchangeCode,
  getSpotifyUserId,
  saveTrack,
  parseTrackId,
} from "@/lib/spotify";

// Spotify redirects here after the user authorizes. We exchange the code,
// store a real PreSave row, and (when possible) save the track immediately.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = sp.get("code");
  const state = sp.get("state") ?? "";
  const error = sp.get("error");
  const [nonce, slug] = state.split(".");

  const back = (status: string) =>
    NextResponse.redirect(new URL(`/${slug ?? ""}?presave=${status}`, req.url));

  if (error || !code || !slug) return back("error");

  // Validate CSRF nonce against the cookie.
  const jar = await cookies();
  if (jar.get("sl_oauth")?.value !== nonce) return back("error");
  jar.delete("sl_oauth");

  try {
    const link = await prisma.smartLink.findUnique({
      where: { slug },
      include: { platforms: true },
    });
    if (!link) return back("error");

    const tokens = await exchangeCode(code);
    const userId = await getSpotifyUserId(tokens.access_token);

    const spotifyUrl = link.platforms.find((p) => p.dsp === "spotify")?.url;
    const trackId = spotifyUrl ? parseTrackId(spotifyUrl) : null;
    let saved = false;
    if (trackId) saved = await saveTrack(tokens.access_token, trackId);

    await prisma.preSave.upsert({
      where: { smartLinkId_spotifyUserId: { smartLinkId: link.id, spotifyUserId: userId } },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        saved,
      },
      create: {
        smartLinkId: link.id,
        spotifyUserId: userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        saved,
      },
    });

    // Record the pre-save as a tracked conversion too.
    await prisma.click.create({
      data: { dsp: "spotify", smartLinkId: link.id, isPreSave: true, userAgent: "presave" },
    });

    return back(saved ? "saved" : "ok");
  } catch (err) {
    console.error("spotify callback failed", err);
    return back("error");
  }
}
