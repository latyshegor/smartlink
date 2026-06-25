import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Click tracker: record the platform click, then 302 to the DSP.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const platform = await prisma.platformLink.findUnique({ where: { id } });
  if (!platform) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    await prisma.click.create({
      data: {
        dsp: platform.dsp,
        smartLinkId: platform.smartLinkId,
        userAgent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
        country: req.headers.get("x-vercel-ip-country") ?? null,
      },
    });
  } catch (err) {
    // Never block the redirect on a tracking failure — but make it visible.
    console.error("click tracking failed", err);
  }

  return NextResponse.redirect(platform.url, { status: 302 });
}
