import { DspIcon } from "./DspIcon";
import { DSP_MAP } from "@/lib/dsp";
import {
  ThemeConfig,
  FONT_VAR,
  backgroundStyle,
} from "@/lib/theme";

export interface ViewLink {
  slug: string;
  title: string;
  artistName: string;
  coverUrl: string;
  releaseDate?: string | Date | null;
}

export interface ViewPlatform {
  id: string;
  dsp: string;
  url: string;
}

interface Props {
  link: ViewLink;
  platforms: ViewPlatform[];
  theme: ThemeConfig;
  preview?: boolean; // admin live preview: buttons inert
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}

export function SmartLinkView({ link, platforms, theme, preview = false }: Props) {
  const dark = theme.dark;
  const text = dark ? "#ffffff" : "#16151a";
  const subtext = dark ? "rgba(255,255,255,0.62)" : "rgba(20,20,28,0.58)";
  const isFuture =
    link.releaseDate != null && new Date(link.releaseDate).getTime() > Date.now();

  const spotify = platforms.find((p) => p.dsp === "spotify");

  function buttonChrome(): React.CSSProperties {
    switch (theme.buttonStyle) {
      case "solid":
        return { background: theme.accent, color: pickFg(theme.accent), border: "1px solid transparent" };
      case "outline":
        return {
          background: "transparent",
          color: text,
          border: `1.5px solid ${dark ? "rgba(255,255,255,0.35)" : "rgba(20,20,28,0.22)"}`,
        };
      case "glass":
      default:
        return {
          background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
          color: text,
          border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(20,20,28,0.08)"}`,
          backdropFilter: "blur(12px)",
        };
    }
  }

  const Btn = preview ? "div" : "a";

  return (
    <div
      className="relative flex min-h-full w-full flex-col items-center overflow-hidden"
      style={{ ...backgroundStyle(theme), fontFamily: FONT_VAR[theme.font], color: text }}
    >
      {/* Cover-driven or custom-image blurred backdrop */}
      {(theme.background === "cover" || (theme.background === "image" && theme.bgImage)) && (
        <>
          <div
            className="pointer-events-none absolute inset-0 scale-125"
            style={{
              backgroundImage: `url(${theme.background === "image" ? theme.bgImage : link.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${theme.coverBlur}px) saturate(1.3)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: dark
                ? "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.9) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.92) 100%)",
            }}
          />
        </>
      )}

      <main className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pb-10 pt-12 sm:pt-16">
        {/* Cover art */}
        <div className="sl-rise mx-auto w-full max-w-[300px]">
          <div
            className="relative aspect-square w-full overflow-hidden shadow-2xl"
            style={{
              borderRadius: theme.radius * 1.3,
              boxShadow: `0 30px 60px -20px ${hexToRgba(theme.accent, 0.5)}, 0 10px 30px rgba(0,0,0,0.45)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={link.coverUrl}
              alt={`${link.title} cover`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="sl-rise mt-7 text-center" style={{ animationDelay: "60ms" }}>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]">
            {link.title}
          </h1>
          <p className="mt-1.5 text-[15px] font-medium" style={{ color: subtext }}>
            {link.artistName}
          </p>
        </div>

        {/* Pre-save spotlight (only when there's a Spotify link) */}
        {spotify && (
          <PreSaveButton
            slug={link.slug}
            accent={theme.accent}
            radius={theme.radius}
            dark={dark}
            future={isFuture}
            preview={preview}
          />
        )}

        <p
          className="sl-rise mb-3 mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: subtext, animationDelay: "120ms" }}
        >
          {isFuture ? "Also available to stream" : "Choose your platform"}
        </p>

        {/* DSP buttons */}
        <div className="flex flex-col gap-2.5">
          {platforms.map((p, i) => {
            const meta = DSP_MAP[p.dsp];
            return (
              <Btn
                key={p.id}
                {...(preview
                  ? {}
                  : { href: `/api/go/${p.id}`, rel: "noopener" })}
                className="sl-rise group flex items-center gap-3.5 px-4 py-3.5 transition-transform active:scale-[0.98] hover:-translate-y-0.5"
                style={{
                  ...buttonChrome(),
                  borderRadius: theme.radius,
                  animationDelay: `${150 + i * 50}ms`,
                  textDecoration: "none",
                  cursor: preview ? "default" : "pointer",
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: hexToRgba(meta?.color ?? "#888", 0.16), color: meta?.color }}
                >
                  <DspIcon id={p.dsp} className="h-6 w-6" />
                </span>
                <span className="flex-1 text-left text-[15px] font-semibold">
                  {meta?.label ?? p.dsp}
                </span>
                <span
                  className="rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-colors"
                  style={{
                    background:
                      theme.buttonStyle === "solid"
                        ? hexToRgba("#000000", 0.18)
                        : hexToRgba(theme.accent, dark ? 0.9 : 0.95),
                    color:
                      theme.buttonStyle === "solid" ? pickFg(theme.accent) : pickFg(theme.accent),
                  }}
                >
                  {meta?.cta ?? "Open"}
                </span>
              </Btn>
            );
          })}
        </div>

        <footer className="mt-auto pt-10 text-center">
          <span className="text-[11px] font-medium tracking-wide" style={{ color: subtext }}>
            Made with ◆ Linkhub
          </span>
        </footer>
      </main>
    </div>
  );
}

function PreSaveButton({
  slug,
  accent,
  radius,
  dark,
  future,
  preview,
}: {
  slug: string;
  accent: string;
  radius: number;
  dark: boolean;
  future: boolean;
  preview: boolean;
}) {
  const Btn = preview ? "div" : "a";
  return (
    <Btn
      {...(preview ? {} : { href: `/api/spotify/login?link=${encodeURIComponent(slug)}` })}
      className="sl-rise mt-6 flex items-center justify-center gap-2.5 px-4 py-4 font-bold transition-transform active:scale-[0.98] hover:-translate-y-0.5"
      style={{
        background: "#1DB954",
        color: "#fff",
        borderRadius: radius,
        animationDelay: "90ms",
        textDecoration: "none",
        cursor: preview ? "default" : "pointer",
        boxShadow: `0 12px 28px -10px ${dark ? "rgba(29,185,84,0.7)" : "rgba(29,185,84,0.5)"}`,
      }}
    >
      <DspIcon id="spotify" className="h-6 w-6" />
      <span className="text-[15px]">
        {future ? "Pre-save on Spotify" : "Save on Spotify"}
      </span>
    </Btn>
  );
}

// Choose readable foreground (black/white) for a given accent.
function pickFg(hex: string): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#16151a" : "#ffffff";
}
