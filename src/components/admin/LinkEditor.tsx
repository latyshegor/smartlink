"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { DSPS } from "@/lib/dsp";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/theme";
import { SmartLinkView } from "@/components/SmartLinkView";
import { saveLink, deleteLink, extractAccent } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { Field, inputCls, PhoneFrame } from "./controls";
import { ThemeControls } from "./ThemeControls";

export interface EditorInitial {
  id?: string;
  title: string;
  artistName: string;
  coverUrl: string;
  slug: string;
  releaseDate: string; // yyyy-mm-dd or ""
  theme: ThemeConfig;
  platforms: Record<string, string>; // dsp -> url
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export function LinkEditor({ initial }: { initial: EditorInitial }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [artistName, setArtistName] = useState(initial.artistName);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [releaseDate, setReleaseDate] = useState(initial.releaseDate);
  const [theme, setTheme] = useState<ThemeConfig>(initial.theme);
  const [platforms, setPlatforms] = useState<Record<string, string>>(initial.platforms);
  const [linkId, setLinkId] = useState<string | undefined>(initial.id);

  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const previewPlatforms = useMemo(
    () =>
      DSPS.filter((d) => platforms[d.id]?.trim()).map((d) => ({
        id: d.id,
        dsp: d.id,
        url: platforms[d.id],
      })),
    [platforms],
  );

  const publicUrl = savedSlug ? `${BASE}/${savedSlug}` : "";
  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { margin: 1, width: 240 }).then(setQr).catch(() => {});
  }, [publicUrl]);

  function patchTheme(p: Partial<ThemeConfig>) {
    setTheme((t) => ({ ...t, ...p }));
  }

  async function onExtract() {
    if (!coverUrl.trim()) return;
    setExtracting(true);
    const r = await extractAccent(coverUrl.trim());
    setExtracting(false);
    if (r.accent) patchTheme({ accent: r.accent });
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const r = await saveLink({
        id: linkId,
        title,
        artistName,
        coverUrl,
        slug,
        releaseDate: releaseDate || null,
        themeConfig: theme,
        platforms: DSPS.map((d) => ({ dsp: d.id, url: platforms[d.id] ?? "" })),
      });
      if (r?.error) setError(r.error);
      else if (r?.ok) {
        setSavedSlug(r.slug!);
        if (r.id) setLinkId(r.id);
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (!linkId) return;
    if (!confirm("Delete this smart link? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteLink(linkId);
      router.push("/admin/links");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="order-2 flex flex-col gap-7 lg:order-1">
        <Section title="Track details">
          <Field label="Title">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Track or release title" />
          </Field>
          <Field label="Artist name">
            <input className={inputCls} value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Artist" />
          </Field>
          <Field label="Cover image URL">
            <input className={inputCls} value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…/cover.jpg" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Custom slug">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3">
                <span className="text-[13px] text-white/35">/</span>
                <input
                  className="w-full bg-transparent px-1 py-3 text-[15px] outline-none"
                  value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  placeholder="my-track"
                />
              </div>
            </Field>
            <Field label="Release date (optional)">
              <input type="date" className={inputCls} value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Platforms">
          <p className="-mt-2 mb-1 text-[12px] text-white/40">Paste the link for each platform. Empty platforms are hidden.</p>
          {DSPS.map((d) => (
            <Field key={d.id} label={d.label}>
              <input
                className={inputCls}
                value={platforms[d.id] ?? ""}
                onChange={(e) => setPlatforms((p) => ({ ...p, [d.id]: e.target.value }))}
                placeholder={`https://…  (${d.label})`}
              />
            </Field>
          ))}
        </Section>

        <Section title="Theme constructor">
          <ThemeControls
            theme={theme}
            onPatch={patchTheme}
            onReset={() => setTheme({ ...DEFAULT_THEME })}
            onExtractAccent={onExtract}
            extracting={extracting}
          />
        </Section>

        {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] text-red-300">{error}</p>}

        <div className="flex items-center gap-3">
          <button onClick={onSave} disabled={pending} className="rounded-xl bg-white px-6 py-3 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {pending ? "Saving…" : linkId ? "Save changes" : "Create link"}
          </button>
          {linkId && (
            <button onClick={onDelete} disabled={pending} className="rounded-xl border border-red-500/30 px-4 py-3 text-[14px] font-semibold text-red-300 hover:bg-red-500/10">
              Delete
            </button>
          )}
        </div>

        {savedSlug && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-[14px] font-semibold text-emerald-200">Saved ✓</p>
            <a href={`/${savedSlug}`} target="_blank" rel="noopener" className="mt-1 block break-all text-[13px] text-emerald-300 hover:underline">
              {publicUrl} ↗
            </a>
            {qr && (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code" className="h-24 w-24 rounded-lg bg-white p-1" />
                <p className="text-[12px] text-white/50">Scan to open the page.<br />Share this QR on flyers or stories.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-20">
          <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40">Live preview</p>
          <PhoneFrame>
            <SmartLinkView
              preview
              link={{ slug, title: title || "Untitled", artistName: artistName || "Artist", coverUrl: coverUrl || "https://picsum.photos/seed/sl/600/600", releaseDate: releaseDate || null }}
              platforms={previewPlatforms}
              theme={theme}
            />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-white/50">{title}</h2>
      {children}
    </section>
  );
}
