"use client";

import { useActionState, useEffect, useState } from "react";
import { createPostAction, type FormState } from "@/lib/actions/posts";
import { PenSquare, Paperclip } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function PostComposer({
  canPostPlatformWide,
  canPin,
  deptName,
}: {
  canPostPlatformWide: boolean;
  canPin: boolean;
  deptName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createPostAction, null);
  const showToast = useToast();

  useEffect(() => {
    if (state && !state.error) {
      showToast("Update published.", "success");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line px-5 py-3 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <PenSquare size={15} /> Post a new update
      </button>
    );
  }

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-lg p-5">
      <p className="font-display text-lg font-medium text-ink">New update</p>
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required placeholder="Title" className="input" />
      <textarea name="body" required rows={4} placeholder="What's happening?" className="input resize-none" />

      <label className="flex items-center gap-2 text-xs text-ink-soft">
        <Paperclip size={13} />
        <input
          type="file"
          name="attachment"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          className="text-xs file:mr-2 file:rounded-full file:border file:border-line file:bg-paper file:px-2.5 file:py-1 file:text-xs file:text-ink-soft hover:file:border-ink"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
        <label className="flex items-center gap-2">
          <input type="radio" name="scope" value="department" defaultChecked />
          Post to {deptName ?? "my department"}
        </label>
        {canPostPlatformWide && (
          <label className="flex items-center gap-2">
            <input type="radio" name="scope" value="platform" />
            Post platform-wide
          </label>
        )}
        {canPin && (
          <label className="ml-auto flex items-center gap-2">
            <input type="checkbox" name="pinned" />
            Pin this update
          </label>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
