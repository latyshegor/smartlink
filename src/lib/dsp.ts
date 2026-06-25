// Supported DSPs (digital service providers). Order = default display order.
export interface DspMeta {
  id: string;
  label: string;
  color: string; // brand color
  cta: string; // button verb
}

export const DSPS: DspMeta[] = [
  { id: "spotify", label: "Spotify", color: "#1DB954", cta: "Play" },
  { id: "apple", label: "Apple Music", color: "#FA243C", cta: "Play" },
  { id: "youtube", label: "YouTube Music", color: "#FF0000", cta: "Play" },
  { id: "amazon", label: "Amazon Music", color: "#25D1DA", cta: "Play" },
  { id: "deezer", label: "Deezer", color: "#A238FF", cta: "Play" },
];

export const DSP_MAP: Record<string, DspMeta> = Object.fromEntries(
  DSPS.map((d) => [d.id, d]),
);

export function dspLabel(id: string): string {
  return DSP_MAP[id]?.label ?? id;
}

export function dspColor(id: string): string {
  return DSP_MAP[id]?.color ?? "#666";
}
