// Theme constructor: artist customizes background, font, accent, button style.
// Stored as SmartLink.themeConfig (JSON), rendered via CSS variables.

export type BackgroundType = "cover" | "gradient" | "solid";
export type FontKey = "sans" | "display" | "serif" | "mono";
export type ButtonStyle = "glass" | "solid" | "outline";

export interface ThemeConfig {
  background: BackgroundType;
  bgFrom: string; // gradient/solid color 1
  bgTo: string; // gradient color 2
  bgAngle: number; // gradient angle (deg)
  coverBlur: number; // px blur when background = cover
  font: FontKey;
  accent: string; // hex, drives buttons/highlights
  buttonStyle: ButtonStyle;
  radius: number; // px, button + card corner radius
  dark: boolean; // light or dark text scheme
}

export const FONT_VAR: Record<FontKey, string> = {
  sans: "var(--font-sans)",
  display: "var(--font-display)",
  serif: "var(--font-serif)",
  mono: "var(--font-mono)",
};

export const DEFAULT_THEME: ThemeConfig = {
  background: "cover",
  bgFrom: "#1a1a2e",
  bgTo: "#0f0f1a",
  bgAngle: 160,
  coverBlur: 60,
  font: "display",
  accent: "#1DB954",
  buttonStyle: "glass",
  radius: 16,
  dark: true,
};

export const THEME_PRESETS: { id: string; label: string; config: ThemeConfig }[] = [
  {
    id: "midnight",
    label: "Midnight",
    config: { ...DEFAULT_THEME },
  },
  {
    id: "editorial",
    label: "Editorial",
    config: {
      background: "solid",
      bgFrom: "#f4f1ea",
      bgTo: "#f4f1ea",
      bgAngle: 0,
      coverBlur: 0,
      font: "serif",
      accent: "#1a1a1a",
      buttonStyle: "outline",
      radius: 4,
      dark: false,
    },
  },
  {
    id: "neon",
    label: "Neon",
    config: {
      background: "gradient",
      bgFrom: "#ff006e",
      bgTo: "#3a0ca3",
      bgAngle: 135,
      coverBlur: 0,
      font: "display",
      accent: "#ffd60a",
      buttonStyle: "solid",
      radius: 28,
      dark: true,
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    config: {
      background: "gradient",
      bgFrom: "#f97316",
      bgTo: "#7c2d92",
      bgAngle: 150,
      coverBlur: 0,
      font: "sans",
      accent: "#ffffff",
      buttonStyle: "glass",
      radius: 20,
      dark: true,
    },
  },
];

export function normalizeTheme(input: unknown): ThemeConfig {
  const t = (input ?? {}) as Partial<ThemeConfig>;
  return {
    background: t.background ?? DEFAULT_THEME.background,
    bgFrom: t.bgFrom ?? DEFAULT_THEME.bgFrom,
    bgTo: t.bgTo ?? DEFAULT_THEME.bgTo,
    bgAngle: typeof t.bgAngle === "number" ? t.bgAngle : DEFAULT_THEME.bgAngle,
    coverBlur: typeof t.coverBlur === "number" ? t.coverBlur : DEFAULT_THEME.coverBlur,
    font: t.font ?? DEFAULT_THEME.font,
    accent: t.accent ?? DEFAULT_THEME.accent,
    buttonStyle: t.buttonStyle ?? DEFAULT_THEME.buttonStyle,
    radius: typeof t.radius === "number" ? t.radius : DEFAULT_THEME.radius,
    dark: typeof t.dark === "boolean" ? t.dark : DEFAULT_THEME.dark,
  };
}

// Background CSS for the page wrapper, given a cover image to optionally blur.
export function backgroundStyle(t: ThemeConfig): React.CSSProperties {
  if (t.background === "solid") return { background: t.bgFrom };
  if (t.background === "gradient")
    return { background: `linear-gradient(${t.bgAngle}deg, ${t.bgFrom}, ${t.bgTo})` };
  // cover: handled by a separate blurred image layer; base fallback color
  return { background: t.bgFrom };
}
