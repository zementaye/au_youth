"use client";

import { useActionState, useState } from "react";
import { createHelpRequestAction, type FormState } from "@/lib/actions/help-requests";
import { X, MessageSquarePlus } from "lucide-react";

export default function HelpRequestComposer({ skillOptions }: { skillOptions: string[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createHelpRequestAction, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const matches = skillOptions.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s) && skillInput.length > 0
  );

  function addSkill(name: string) {
    const trimmed = name.trim();
    if (!trimmed || selectedSkills.includes(trimmed)) return;
    setSelectedSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line px-5 py-3 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <MessageSquarePlus size={15} /> Post a help request
      </button>
    );
  }

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-lg p-5">
      <p className="font-display text-lg font-medium text-ink">New help request</p>
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required placeholder="e.g. Networking issue in our office" className="input" />
      <textarea name="description" required rows={3} placeholder="Describe what's going on" className="input resize-none" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Required skill(s)</label>
        <div className="input flex flex-wrap items-center gap-1.5 !py-2">
          {selectedSkills.map((s) => (
            <span key={s} className="tag flex items-center gap-1 !bg-gold-soft/40">
              {s}
              <button type="button" onClick={() => setSelectedSkills((p) => p.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder={selectedSkills.length === 0 ? "Type a skill and press Enter" : "Add another…"}
            className="min-w-[140px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
          />
        </div>
        {matches.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {matches.slice(0, 6).map((m) => (
              <button key={m} type="button" onClick={() => addSkill(m)} className="tag hover:bg-gold-soft/40">
                + {m}
              </button>
            ))}
          </div>
        )}
        {selectedSkills.map((s) => (
          <input key={s} type="hidden" name="skills" value={s} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--paper);
          border-radius: 0.5rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          color: var(--ink);
        }
        .input:focus {
          outline: 2px solid var(--coral);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}
