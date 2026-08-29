"use client";

import { useActionState, useEffect, useState } from "react";
import { editHelpRequestAction, type FormState } from "@/lib/actions/help-requests";
import { X } from "lucide-react";

type Req = { id: string; title: string; description: string; skills: string[] };

export default function EditHelpRequestForm({
  request,
  skillOptions,
  onDone,
}: {
  request: Req;
  skillOptions: string[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(editHelpRequestAction, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(request.skills);
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

  useEffect(() => {
    if (state && !state.error) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-lg p-5">
      <input type="hidden" name="helpRequestId" value={request.id} />
      <p className="font-display text-lg font-medium text-ink">Edit help request</p>
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required defaultValue={request.title} className="input" />
      <textarea name="description" required rows={3} defaultValue={request.description} className="input resize-none" />

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
            placeholder="Add another…"
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
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-ink-soft hover:text-ink">
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
