import { accentAt } from "@/lib/accent";
import type { CSSProperties } from "react";

// A row of abstract, flat-color figures standing in for the community —
// deliberately not photographic (no real people, no stock imagery, no
// stereotypical costuming): simple geometric silhouettes in the same
// vibrant palette as the rest of the site, each one a different accent
// color and a slightly different height, gently swaying like they're
// mid-conversation.
const HEIGHTS = [64, 78, 58, 84, 66, 76, 60, 80];

export default function PeopleBand() {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5" aria-hidden="true">
      {HEIGHTS.map((h, i) => (
        <svg
          key={i}
          width={h * 0.62}
          height={h}
          viewBox="0 0 40 64"
          className="animate-sway"
          style={{ "--delay": `${i * 180}ms` } as CSSProperties}
        >
          <circle cx="20" cy="10" r="9" fill={accentAt(i)} />
          <path
            d="M6 62 C6 38 12 28 20 28 C28 28 34 38 34 62 Z"
            fill={accentAt(i)}
            opacity={0.85}
          />
        </svg>
      ))}
    </div>
  );
}
