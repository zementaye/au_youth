// Deterministic color assignment for departments, cycling through the full
// palette (not just marigold) so department badges, card edges, and tags
// carry real color instead of defaulting to grey. Every class name below is
// written out literally (not built with a template string) so Tailwind's
// scanner picks it up at build time — a computed `bg-${x}` string would get
// dropped in production.
//
// Same department always gets the same color within a single render (and
// deterministically across renders, since it's derived from the name
// rather than array position), so a department's color stays recognizable
// across the feed, help board, and dashboard once those adopt this too.

const PALETTE = [
  {
    edge: "border-l-marigold",
    chip: "bg-marigold-soft text-ink",
    dot: "bg-marigold",
    solid: "bg-marigold text-ink",
  },
  {
    edge: "border-l-indigo",
    chip: "bg-indigo-soft text-ink",
    dot: "bg-indigo",
    solid: "bg-indigo text-paper",
  },
  {
    edge: "border-l-brick",
    chip: "bg-brick-soft text-ink",
    dot: "bg-brick",
    solid: "bg-brick text-paper",
  },
  {
    edge: "border-l-forest",
    chip: "bg-forest-soft text-ink",
    dot: "bg-forest",
    solid: "bg-forest text-paper",
  },
] as const;

export type DeptColor = (typeof PALETTE)[number];

export function deptColor(name: string | null | undefined): DeptColor {
  const key = name ?? "Unassigned";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

// Initials for a colored avatar chip, e.g. "Youth Outreach" -> "YO".
export function initials(name: string | null | undefined): string {
  const key = (name ?? "?").trim();
  if (!key) return "?";
  const parts = key.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
