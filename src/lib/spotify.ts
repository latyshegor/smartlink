// Real Spotify OAuth helpers for the pre-save flow.

export const SPOTIFY_SCOPES = "user-library-modify user-read-email user-read-private";

export function spotifyConfigured(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export function redirectUri(): string {
  return `${baseUrl()}/api/spotify/callback`;
}

export function authorizeUrl(state: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri(),
    state,
  });
  return `https://accounts.spotify.com/authorize?${p.toString()}`;
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCode(code: string): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
  });
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getSpotifyUserId(accessToken: string): Promise<string> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`me failed: ${res.status}`);
  const me = await res.json();
  return me.id as string;
}

// Save a track to the user's library. Returns true on success.
export async function saveTrack(accessToken: string, trackId: string): Promise<boolean> {
  const res = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

// Parse a Spotify track id from an open.spotify.com/track/<id> URL.
export function parseTrackId(url: string): string | null {
  const m = url.match(/track\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}
