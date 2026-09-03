"use client";

import { useState, useTransition } from "react";
import {
  claimHelpRequestAction,
  resolveHelpRequestAction,
  unclaimHelpRequestAction,
  reopenHelpRequestAction,
  deleteHelpRequestAction,
} from "@/lib/actions/help-requests";
import { CheckCircle2, HandHelping, Circle, Pencil, Trash2, RotateCcw } from "lucide-react";
import EditHelpRequestForm from "./EditHelpRequestForm";
import { formatShortDate } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";

type Req = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date | string | null;
  requestedById: string;
  requestedByName: string | null;
  claimedById: string | null;
  claimedByName: string | null;
  deptName: string | null;
  skills: string[];
  canManage: boolean;
};

export default function HelpRequestList({
  requests,
  currentUserId,
  skillOptions,
}: {
  requests: Req[];
  currentUserId: string | null;
  skillOptions: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const showToast = useToast();

  function runAction(
    action: () => Promise<{ error?: string } | undefined>,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(successMessage, "success");
      }
    });
  }

  return (
    <div className="space-y-4">
      {requests.map((r) =>
        editingId === r.id ? (
          <EditHelpRequestForm
            key={r.id}
            request={r}
            skillOptions={skillOptions}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <article key={r.id} className="card-raised rounded-lg p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <StatusBadge status={r.status} />
              {r.deptName && <span className="tag">{r.deptName}</span>}
              {r.canManage && (
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => setEditingId(r.id)}
                    aria-label="Edit"
                    className="rounded-full p-1 text-ink-soft hover:bg-paper hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      if (confirm("Delete this help request? This can't be undone.")) {
                        runAction(() => deleteHelpRequestAction(r.id), "Help request deleted.");
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
            <h3 className="font-display text-lg font-medium leading-snug text-ink">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.description}</p>
            {r.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.skills.map((s) => (
                  <span key={s} className="tag !border-coral/30 !text-coral">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line-soft pt-3 text-xs text-ink-soft/80">
              <span className="meta">
                Requested by {r.requestedByName ?? "someone"} · {formatShortDate(r.createdAt)}
              </span>
              {r.claimedByName && r.status === "CLAIMED" && (
                <span className="flex items-center gap-1 text-sage">
                  <HandHelping size={13} /> {r.claimedByName} is helping
                </span>
              )}
              <div className="ml-auto flex gap-2">
                {currentUserId && r.status === "OPEN" && r.requestedById !== currentUserId && (
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => claimHelpRequestAction(r.id), "You're now helping with this request.")}
                    className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
                  >
                    I can help
                  </button>
                )}
                {currentUserId && r.status === "CLAIMED" && (r.claimedById === currentUserId || r.canManage) && (
                  <button
                    disabled={isPending}
                    onClick={() =>
                      runAction(
                        () => unclaimHelpRequestAction(r.id),
                        r.claimedById === currentUserId ? "You've stepped back from this request." : "Request reopened."
                      )
                    }
                    className="flex items-center gap-1 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
                  >
                    <RotateCcw size={12} /> {r.claimedById === currentUserId ? "Step back" : "Reopen"}
                  </button>
                )}
                {currentUserId && r.status !== "RESOLVED" && r.canManage && (
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => resolveHelpRequestAction(r.id), "Marked as resolved.")}
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
                  >
                    Mark resolved
                  </button>
                )}
                {currentUserId && r.status === "RESOLVED" && r.canManage && (
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => reopenHelpRequestAction(r.id), "Request reopened.")}
                    className="flex items-center gap-1 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
                  >
                    <RotateCcw size={12} /> Reopen
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      )}
      {requests.length === 0 && <p className="text-sm text-ink-soft">No help requests yet.</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "OPEN")
    return (
      <span className="flex items-center gap-1 text-coral">
        <Circle size={10} fill="currentColor" /> Open
      </span>
    );
  if (status === "CLAIMED")
    return (
      <span className="flex items-center gap-1 text-gold">
        <HandHelping size={12} /> Claimed
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-sage">
      <CheckCircle2 size={12} /> Resolved
    </span>
  );
}
