// Linkhub wordmark: a hub-and-spoke mark (one hub linking to many platforms)
// + the wordmark in the display face. Accent-lime mark, white text.

export function LogoMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {/* spokes */}
      <g stroke="var(--lh-accent)" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="12" x2="12" y2="4" />
        <line x1="12" y1="12" x2="19" y2="16" />
        <line x1="12" y1="12" x2="5" y2="16" />
      </g>
      {/* outer nodes */}
      <g fill="var(--lh-accent)">
        <circle cx="12" cy="3.4" r="2.1" />
        <circle cx="19.5" cy="16.4" r="2.1" />
        <circle cx="4.5" cy="16.4" r="2.1" />
      </g>
      {/* hub */}
      <circle cx="12" cy="12" r="3" fill="#fff" />
    </svg>
  );
}

export function Logo({
  size = 22,
  textClass = "text-[15px]",
}: {
  size?: number;
  textClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-bold">
      <LogoMark size={size} />
      <span className={textClass} style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
        Linkhub
      </span>
    </span>
  );
}
