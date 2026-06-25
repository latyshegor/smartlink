import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { spotifyConfigured, authorizeUrl } from "@/lib/spotify";

// Kick off the Spotify OAuth pre-save flow for a given smart link slug.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("link");
  if (!slug) return NextResponse.redirect(new URL("/", req.url));

  if (!spotifyConfigured()) {
    // No creds configured — bounce back with a friendly notice instead of 500.
    return NextResponse.redirect(new URL(`/${slug}?presave=unconfigured`, req.url));
  }

  // CSRF: random nonce in state + httpOnly cookie, carry the slug too.
  const nonce = randomBytes(16).toString("hex");
  const state = `${nonce}.${slug}`;

  const jar = await cookies();
  jar.set("sl_oauth", nonce, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.redirect(authorizeUrl(state));
}
