"use client";

import { useEffect, useState } from "react";

const MESSAGES: Record<string, { text: string; tone: "ok" | "err" }> = {
  saved: { text: "Saved to your Spotify library ✓", tone: "ok" },
  ok: { text: "Pre-save confirmed ✓", tone: "ok" },
  error: { text: "Spotify pre-save failed — please try again", tone: "err" },
  unconfigured: { text: "Spotify pre-save is not configured yet", tone: "err" },
};

export function PreSaveToast({ status }: { status?: string }) {
  const [show, setShow] = useState(false);
  const msg = status ? MESSAGES[status] : undefined;

  useEffect(() => {
    if (!msg) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg || !show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        className="sl-rise pointer-events-auto rounded-full px-5 py-3 text-[14px] font-semibold shadow-2xl backdrop-blur"
        style={{
          background: msg.tone === "ok" ? "rgba(29,185,84,0.95)" : "rgba(220,38,38,0.95)",
          color: "#fff",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}
