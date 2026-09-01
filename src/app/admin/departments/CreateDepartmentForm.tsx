"use client";

import { useActionState, useState } from "react";
import { createDepartmentAction, type FormState } from "@/lib/actions/admin";
import { Plus } from "lucide-react";

export default function CreateDepartmentForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createDepartmentAction, null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-none border border-dashed border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Plus size={15} /> New department
      </button>
    );
  }

  return (
    <form action={formAction} className="card-raised space-y-3 rounded-none p-5">
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="name" required placeholder="Department name" className="input" />
      <textarea name="description" rows={2} placeholder="Short description (optional)" className="input resize-none" />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-none bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create department"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
