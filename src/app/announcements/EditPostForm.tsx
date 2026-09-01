"use client";

import { useActionState, useEffect } from "react";
import { editPostAction, type FormState } from "@/lib/actions/posts";

type Post = { id: string; title: string; body: string; pinned: boolean };

export default function EditPostForm({
  post,
  canPin,
  onDone,
}: {
  post: Post;
  canPin: boolean;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(editPostAction, null);

  useEffect(() => {
    if (state && !state.error) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="card-raised space-y-4 rounded-none p-5">
      <input type="hidden" name="postId" value={post.id} />
      <p className="font-display text-lg font-medium text-ink">Edit update</p>
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-2 text-sm text-coral">
          {state.error}
        </div>
      )}
      <input name="title" required defaultValue={post.title} className="input" />
      <textarea name="body" required rows={4} defaultValue={post.body} className="input resize-none" />

      <label className="flex items-center gap-2 text-xs text-ink-soft">
        Replace attachment (optional):
        <input
          type="file"
          name="attachment"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          className="text-xs file:mr-2 file:rounded-none file:border file:border-line file:bg-paper file:px-2.5 file:py-1 file:text-xs file:text-ink-soft hover:file:border-ink"
        />
      </label>

      {canPin && (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="pinned" defaultChecked={post.pinned} />
          Pin this update
        </label>
      )}

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
