import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSession {
  artistId?: string;
  email?: string;
}

const password = process.env.SESSION_SECRET;
if (!password || password.length < 32) {
  // Fail loud at module load rather than silently issuing weak cookies.
  throw new Error("SESSION_SECRET missing or shorter than 32 chars");
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "smartlink_admin",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, sessionOptions);
}
