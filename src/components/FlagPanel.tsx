import { accentAt } from "@/lib/accent";

// A band of solid color blocks — the graphic, editorial equivalent of a
// flag or textile stripe, standing in for "many departments, many
// nations, one network" without depicting any specific country's flag.
export default function FlagPanel({ labels }: { labels?: string[] }) {
  const blocks = labels && labels.length > 0 ? labels : Array.from({ length: 8 }, () => "");
  return (
    <div className="flex h-20 w-full sm:h-28">
      {blocks.map((label, i) => (
        <div
          key={i}
          className="flex flex-1 items-end justify-center pb-2"
          style={{ background: accentAt(i) }}
        >
          {label && (
            <span className="truncate px-1 text-center text-[10px] font-medium text-white/90 sm:text-xs">
              {label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
