// A full-width scrolling tagline banner — the kind of confident, repeating
// statement strip you see on movement/campaign sites, built from the
// platform's own real language rather than borrowed copy.
const ITEMS = [
  "AU Youth Network",
  "Find your people",
  "Ask for help",
  "Share what you know",
  "Every department, one network",
];

export default function MarqueeTicker({
  background = "var(--ink)",
  color = "var(--paper)",
}: {
  background?: string;
  color?: string;
}) {
  const items = [...ITEMS, ...ITEMS]; // doubled so the loop has no seam
  return (
    <div className="overflow-hidden py-3" style={{ background }}>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item text-sm" style={{ color }}>
            {item}
            <span aria-hidden="true" style={{ color: "var(--marigold)" }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
