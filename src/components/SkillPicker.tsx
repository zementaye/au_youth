"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronDown, Search } from "lucide-react";

export default function SkillPicker({
  name,
  options,
  value,
  onChange,
  placeholder = "Search or choose skills…",
}: {
  /** Form field name used for the hidden inputs (e.g. "skills"). */
  name: string;
  /** Every known skill the person can choose from. */
  options: string[];
  /** Currently selected skills (controlled). */
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const available = useMemo(
    () => options.filter((o) => !value.includes(o)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((o) => o.toLowerCase().includes(q));
  }, [available, query]);

  const exactMatchExists = options.some((o) => o.toLowerCase() === query.trim().toLowerCase());
  const canAddCustom = query.trim().length > 0 && !exactMatchExists;

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setQuery("");
    inputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="input flex flex-wrap items-center gap-1.5 !py-2 cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((s) => (
          <span key={s} className="tag flex items-center gap-1 !bg-gold-soft/40">
            {s}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(s);
              }}
              aria-label={`Remove ${s}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <div className="flex min-w-[140px] flex-1 items-center gap-1.5">
          <Search size={13} className="shrink-0 text-ink-soft/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length > 0) addSkill(filtered[0]);
                else if (canAddCustom) addSkill(query);
              } else if (e.key === "Escape") {
                setOpen(false);
              } else if (e.key === "Backspace" && query === "" && value.length > 0) {
                removeSkill(value[value.length - 1]);
              }
            }}
            placeholder={value.length === 0 ? placeholder : "Add another…"}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
          />
        </div>
        <ChevronDown size={14} className={`shrink-0 text-ink-soft/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="card-raised absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg p-1.5 shadow-lg">
          {filtered.length > 0 ? (
            <>
              <p className="px-2.5 pb-1 pt-1 text-[10px] font-medium uppercase tracking-wide text-ink-soft/60">
                {query ? `Matching skills` : `All skills (${filtered.length})`}
              </p>
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-paper"
                >
                  {s}
                </button>
              ))}
            </>
          ) : !canAddCustom ? (
            <p className="px-2.5 py-3 text-center text-sm text-ink-soft">
              {available.length === 0 ? "All skills added." : "No matching skills."}
            </p>
          ) : null}

          {canAddCustom && (
            <button
              type="button"
              onClick={() => addSkill(query)}
              className="mt-0.5 block w-full rounded-md border-t border-line-soft px-2.5 py-1.5 text-left text-sm text-coral hover:bg-paper"
            >
              + Add “{query.trim()}” as a new skill
            </button>
          )}
        </div>
      )}

      {value.map((s) => (
        <input key={s} type="hidden" name={name} value={s} />
      ))}
    </div>
  );
}
