"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { DSPS } from "@/lib/dsp";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/theme";
import { SmartLinkView } from "@/components/SmartLinkView";
import { DspIcon } from "@/components/DspIcon";
import { saveLink, extractAccent } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { fileToDataUrl } from "@/lib/upload";
import { Logo } from "@/components/Logo";
import { Field, inputCls, PhoneFrame } from "./controls";
import { ThemeControls } from "./ThemeControls";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const STEPS = ["Your release", "Platforms", "Design", "Publish"] as const;

export function OnboardingWizard({ artistName: initialArtist }: { artistName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState(initialArtist || "");
  const [coverUrl, setCoverUrl] = useState("");
  const [platforms, setPlatforms] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [extracting, setExtracting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const previewPlatforms = useMemo(
    () =>
      DSPS.filter((d) => enabled[d.id] && platforms[d.id]?.trim()).map((d) => ({
        id: d.id,
        dsp: d.id,
        url: platforms[d.id],
      })),
    [enabled, platforms],
  );

  const publicUrl = published ? `${BASE}/${published}` : "";
  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { margin: 1, width: 240 }).then(setQr).catch(() => {});
  }, [publicUrl]);

  function patchTheme(p: Partial<ThemeConfig>) {
    setTheme((t) => ({ ...t, ...p }));
  }

  async function onCoverUpload(file?: File) {
    if (!file) return;
    setCoverUploading(true);
    setError(null);
    try {
      setCoverUrl(await fileToDataUrl(file, 900));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  async function onExtract() {
    if (!coverUrl.trim()) return;
    setExtracting(true);
    const r = await extractAccent(coverUrl.trim());
    setExtracting(false);
    if (r.accent) patchTheme({ accent: r.accent });
  }

  function stepError(s: number): string | null {
    if (s === 0) {
      if (!title.trim()) return "Add a title";
      if (!artistName.trim()) return "Add your artist name";
      if (!coverUrl.trim()) return "Add a cover image";
    }
    if (s === 1) {
      if (previewPlatforms.length === 0) return "Add at least one platform link";
    }
    return null;
  }

  function next() {
    const err = stepError(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const r = await saveLink({
        title,
        artistName,
        coverUrl,
        slug,
        releaseDate: null,
        themeConfig: theme,
        platforms: DSPS.filter((d) => enabled[d.id]).map((d) => ({ dsp: d.id, url: platforms[d.id] ?? "" })),
      });
      if (r?.error) setError(r.error);
      else if (r?.ok) {
        setPublished(r.slug!);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Header + progress */}
      <header className="mb-7 flex items-center justify-between">
        <Logo size={22} textClass="text-[16px]" />
        <Link href="/admin/links" className="text-[13px] text-white/40 hover:text-white">
          Skip to dashboard
        </Link>
      </header>

      <div className="mb-8">
        <div className="mb-3 flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className="h-1.5 rounded-full transition-colors"
                style={{ background: i <= step ? "var(--lh-accent)" : "rgba(255,255,255,0.1)" }}
              />
            </div>
          ))}
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {published ? "You’re live 🎉" : STEPS[step]}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Step content */}
        <div className="order-2 lg:order-1">
          {published ? (
            <PublishedCard publicUrl={publicUrl} slug={published} qr={qr} onDashboard={() => router.push("/admin/links")} />
          ) : (
            <div className="flex flex-col gap-5">
              {step === 0 && (
                <>
                  <Field label="Release / track title">
                    <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Drive" />
                  </Field>
                  <Field label="Artist name">
                    <input className={inputCls} value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Your artist or band name" />
                  </Field>
                  <Field label="Cover artwork">
                    <div className="flex flex-col gap-2">
                      <input className={inputCls} value={coverUrl.startsWith("data:") ? "" : coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Paste an image URL…" />
                      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => onCoverUpload(e.target.files?.[0])} />
                      <button type="button" onClick={() => coverRef.current?.click()} disabled={coverUploading} className="self-start rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/10 disabled:opacity-50">
                        {coverUploading ? "Processing…" : coverUrl ? "↻ Replace upload" : "⬆ …or upload a file"}
                      </button>
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] text-white/50">Toggle the platforms your release is on, then paste each link.</p>
                  {DSPS.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <button
                        type="button"
                        onClick={() => setEnabled((e) => ({ ...e, [d.id]: !e[d.id] }))}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${d.color}28`, color: d.color }}>
                          <DspIcon id={d.id} className="h-5 w-5" />
                        </span>
                        <span className="flex-1 text-[15px] font-semibold">{d.label}</span>
                        <span className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors" style={{ background: enabled[d.id] ? "var(--lh-accent)" : "rgba(255,255,255,0.15)" }}>
                          <span className={`h-5 w-5 rounded-full bg-white transition-transform ${enabled[d.id] ? "translate-x-5" : ""}`} />
                        </span>
                      </button>
                      {enabled[d.id] && (
                        <input
                          className={`${inputCls} mt-3`}
                          value={platforms[d.id] ?? ""}
                          onChange={(e) => setPlatforms((p) => ({ ...p, [d.id]: e.target.value }))}
                          placeholder={`https://…  (${d.label} link)`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <ThemeControls theme={theme} onPatch={patchTheme} onReset={() => setTheme({ ...DEFAULT_THEME })} onExtractAccent={onExtract} extracting={extracting} />
              )}

              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <Field label="Your link address">
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3">
                      <span className="text-[13px] text-white/35">{BASE.replace(/^https?:\/\//, "")}/</span>
                      <input
                        className="w-full bg-transparent px-1 py-3 text-[15px] outline-none"
                        value={slug}
                        onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                        placeholder="your-name"
                      />
                    </div>
                  </Field>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] text-white/60">
                    <p><span className="text-white/40">Release:</span> {title || "—"}</p>
                    <p><span className="text-white/40">Artist:</span> {artistName || "—"}</p>
                    <p><span className="text-white/40">Platforms:</span> {previewPlatforms.length}</p>
                  </div>
                  <button onClick={publish} disabled={pending} className="self-start rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                    {pending ? "Publishing…" : "Publish my page"}
                  </button>
                </div>
              )}

              {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] text-red-300">{error}</p>}

              {/* Nav */}
              <div className="mt-2 flex items-center justify-between">
                <button onClick={back} disabled={step === 0} className="rounded-xl border border-white/15 px-5 py-2.5 text-[14px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-30">
                  Back
                </button>
                {step < STEPS.length - 1 && (
                  <button onClick={next} className="rounded-xl bg-white px-7 py-2.5 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5">
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-8">
            <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">Live preview</p>
            <PhoneFrame>
              <SmartLinkView
                preview
                link={{ slug, title: title || "Your release", artistName: artistName || "Artist", coverUrl: coverUrl || "https://picsum.photos/seed/onb/600/600", releaseDate: null }}
                platforms={previewPlatforms}
                theme={theme}
              />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishedCard({
  publicUrl,
  slug,
  qr,
  onDashboard,
}: {
  publicUrl: string;
  slug: string;
  qr: string | null;
  onDashboard: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <p className="text-[14px] font-semibold text-emerald-200">Your smart link is live</p>
        <a href={`/${slug}`} target="_blank" rel="noopener" className="mt-1 block break-all text-[15px] font-bold text-emerald-300 hover:underline">
          {publicUrl} ↗
        </a>
        <p className="mt-2 text-[13px] text-white/50">Paste this in your bio — Instagram, TikTok, YouTube, anywhere.</p>
        {qr && (
          <div className="mt-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code" className="h-28 w-28 rounded-lg bg-white p-1.5" />
            <p className="text-[12px] text-white/50">Or share this QR on flyers, stories and merch.</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <a href={`/${slug}`} target="_blank" rel="noopener" className="rounded-xl border border-white/15 px-5 py-3 text-[14px] font-semibold hover:bg-white/10">
          View my page
        </a>
        <button onClick={onDashboard} className="rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5">
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
