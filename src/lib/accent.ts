// Deterministically maps a string (department name, id, etc.) to one of the
// eight accent colors, so the same department always gets the same color
// without hand-maintaining a lookup table.
const ACCENTS = [
  "var(--marigold)",
  "var(--indigo)",
  "var(--brick)",
  "var(--forest)",
  "var(--emerald)",
  "var(--terracotta)",
  "var(--royal)",
  "var(--teal)",
] as const;
const ACCENTS_SOFT = [
  "var(--marigold-soft)",
  "var(--indigo-soft)",
  "var(--brick-soft)",
  "var(--forest-soft)",
  "var(--emerald-soft)",
  "var(--terracotta-soft)",
  "var(--royal-soft)",
  "var(--teal-soft)",
] as const;

function hash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

export function accentFor(key: string | null | undefined) {
  const k = key || "unassigned";
  return ACCENTS[hash(k) % ACCENTS.length];
}

export function accentSoftFor(key: string | null | undefined) {
  const k = key || "unassigned";
  return ACCENTS_SOFT[hash(k) % ACCENTS_SOFT.length];
}

export function accentAt(index: number) {
  return ACCENTS[((index % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];
}
