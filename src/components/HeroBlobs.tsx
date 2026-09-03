// Soft organic blob shapes drifting behind the hero — a bolder, more
// editorial backdrop than a thin data-texture, in the spirit of a
// storytelling-movement site rather than a dashboard. Purely decorative
// color, no photography (no real people are depicted here).
import type { CSSProperties } from "react";

const BLOBS = [
  { color: "var(--brand-soft)", cx: 15, cy: 20, r: 34, delay: 0 },
  { color: "var(--marigold-soft)", cx: 85, cy: 15, r: 28, delay: 700 },
  { color: "var(--terracotta-soft)", cx: 75, cy: 80, r: 30, delay: 1400 },
  { color: "var(--royal-soft)", cx: 10, cy: 85, r: 26, delay: 2100 },
];

export default function HeroBlobs() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {BLOBS.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill={b.color}
          opacity={0.55}
          filter="url(#blob-blur)"
          className="animate-blob"
          style={{ "--delay": `${b.delay}ms` } as CSSProperties}
        />
      ))}
      <defs>
        <filter id="blob-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
    </svg>
  );
}
