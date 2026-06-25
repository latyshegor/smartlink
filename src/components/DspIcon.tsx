// Inline brand marks for each DSP. Kept simple + recognizable, currentColor where
// possible so they adapt to button styles; brand-colored where the mark needs it.

export function DspIcon({ id, className = "" }: { id: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (id) {
    case "spotify":
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.32c-.22.36-.68.47-1.04.25-2.85-1.74-6.43-2.13-10.65-1.17-.41.1-.82-.16-.92-.57s.16-.82.57-.92c4.62-1.05 8.58-.6 11.78 1.36.36.22.48.69.26 1.05zm1.47-3.27c-.27.44-.85.59-1.3.31-3.26-2-8.23-2.58-12.08-1.41-.5.15-1.03-.13-1.18-.63s.13-1.03.63-1.18c4.4-1.33 9.88-.68 13.62 1.61.44.28.59.86.31 1.3zm.13-3.4C15.7 8.23 8.86 8 4.98 9.18c-.6.18-1.23-.16-1.41-.76s.16-1.23.76-1.41c4.46-1.35 12.01-1.09 16.74 1.72.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4z" />
        </svg>
      );
    case "apple":
      // Music note glyph
      return (
        <svg {...common} fill="currentColor">
          <path d="M16 3.2c-.02-.5-.5-.84-.99-.72l-6.5 1.62A.9.9 0 0 0 7.8 5v8.02A3.3 3.3 0 0 0 6.3 12.7a3.1 3.1 0 1 0 3.1 3.1V8.13l5.2-1.3v4.4a3.3 3.3 0 0 0-1.5-.32 3.1 3.1 0 1 0 3.1 3.1c0-.06 0-7.7 0-7.7z" />
        </svg>
      );
    case "youtube":
      // Rounded-rect play button
      return (
        <svg {...common} fill="currentColor">
          <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2C1.9 9 1.9 12 1.9 12s0 3 .5 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM10.1 15.3V8.7l5.7 3.3-5.7 3.3z" />
        </svg>
      );
    case "amazon":
      // Music note + Amazon smile
      return (
        <svg {...common} fill="currentColor">
          <path d="M14.5 3.4c0-.42-.4-.72-.8-.6l-5.2 1.5a.8.8 0 0 0-.58.77v6.7a2.7 2.7 0 0 0-1.3-.33 2.65 2.65 0 1 0 2.65 2.65V7.1l4-1.16v3.86a2.7 2.7 0 0 0-1.3-.33 2.65 2.65 0 1 0 2.65 2.65c0-.05 0-8.32 0-8.72z" />
          <path d="M5.2 19.2c3.9 2.3 8.9 2.1 12.6-.5.36-.26.74.22.42.54-2.7 2.7-7.1 3.2-10.4 1.3-.5-.28-1.6-1-2.9-1.9.34.18.18-.1.28.46z" opacity=".9" />
        </svg>
      );
    case "deezer":
      // Equalizer bars (Deezer mark)
      return (
        <svg {...common} fill="currentColor">
          <rect x="2" y="14.5" width="3.6" height="3" rx=".4" />
          <rect x="6.7" y="14.5" width="3.6" height="3" rx=".4" />
          <rect x="11.4" y="14.5" width="3.6" height="3" rx=".4" />
          <rect x="16.1" y="14.5" width="3.6" height="3" rx=".4" />
          <rect x="6.7" y="11" width="3.6" height="3" rx=".4" />
          <rect x="11.4" y="11" width="3.6" height="3" rx=".4" />
          <rect x="16.1" y="11" width="3.6" height="3" rx=".4" />
          <rect x="11.4" y="7.5" width="3.6" height="3" rx=".4" />
          <rect x="16.1" y="7.5" width="3.6" height="3" rx=".4" />
          <rect x="16.1" y="4" width="3.6" height="3" rx=".4" />
        </svg>
      );
    default:
      return (
        <svg {...common} fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}
