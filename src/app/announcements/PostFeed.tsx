"use client";

import { useState, useTransition } from "react";
import { deletePostAction } from "@/lib/actions/posts";
import { Pin, Pencil, Trash2, Paperclip } from "lucide-react";
import EditPostForm from "./EditPostForm";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";

type Post = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: Date | string | null;
  authorName: string | null;
  authorTitle: string | null;
  attachmentUrl: string | null;
  deptName: string | null;
  canManage: boolean;
};

export default function PostFeed({ posts, canPin }: { posts: Post[]; canPin: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const showToast = useToast();

  if (posts.length === 0) {
    return <p className="text-sm text-ink-soft">No updates published yet.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((p) =>
        editingId === p.id ? (
          <EditPostForm key={p.id} post={p} canPin={canPin} onDone={() => setEditingId(null)} />
        ) : (
          <article key={p.id} className="card-raised rounded-lg p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              {p.pinned && (
                <span className="flex items-center gap-1 text-coral">
                  <Pin size={12} /> Pinned
                </span>
              )}
              <span className="tag">{p.deptName ?? "Platform-wide"}</span>
              {p.canManage && (
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => setEditingId(p.id)}
                    aria-label="Edit"
                    className="rounded-full p-1 text-ink-soft hover:bg-paper hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      if (confirm("Delete this update? This can't be undone.")) {
                        startTransition(async () => {
                          const result = await deletePostAction(p.id);
                          if (result?.error) showToast(result.error, "error");
                          else showToast("Update deleted.", "success");
                        });
                      }
                    }}
                    aria-label="Delete"
                    className="rounded-full p-1 text-ink-soft hover:bg-paper hover:text-coral"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
            <h2 className="font-display text-xl font-medium leading-snug text-ink">{p.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{p.body}</p>
            {p.attachmentUrl && (
              <a
                href={p.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex w-fit items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
              >
                <Paperclip size={12} /> View attachment
              </a>
            )}
            <p className="meta mt-4 text-xs text-ink-soft/70">
              {p.authorName}
              {p.authorTitle ? ` · ${p.authorTitle}` : ""} · {formatDate(p.createdAt)}
            </p>
          </article>
        )
      )}
    </div>
  );
}
