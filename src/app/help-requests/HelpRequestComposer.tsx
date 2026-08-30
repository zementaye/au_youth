"use client";

import { useActionState, useState } from "react";
import { createHelpRequestAction, type FormState } from "@/lib/actions/help-requests";
import { MessageSquarePlus } from "lucide-react";
import SkillPicker from "@/components/SkillPicker";

export default function HelpRequestComposer({ skillOptions }: { skillOptions: string[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createHelpRequestAction, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-line px-5 py-3 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <MessageSquarePlus size={15} /> Post a help request
      </button>
    );
  }

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-none p-5">
      <p className="font-display text-lg font-medium text-ink">New help request</p>
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required placeholder="e.g. Networking issue in our office" className="input" />
      <textarea name="description" required rows={3} placeholder="Describe what's going on" className="input resize-none" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Required skill(s)</label>
        <SkillPicker
          name="skills"
          options={skillOptions}
          value={selectedSkills}
          onChange={setSelectedSkills}
          placeholder="Search or choose skills…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-none bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
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
