"use client";

import { useActionState, useEffect, useState } from "react";
import { editHelpRequestAction, type FormState } from "@/lib/actions/help-requests";
import SkillPicker from "@/components/SkillPicker";

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

  useEffect(() => {
    if (state && !state.error) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-none p-5">
      <input type="hidden" name="helpRequestId" value={request.id} />
      <p className="font-display text-lg font-medium text-ink">Edit help request</p>
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required defaultValue={request.title} className="input" />
      <textarea name="description" required rows={3} defaultValue={request.description} className="input resize-none" />

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
          className="rounded-none bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
