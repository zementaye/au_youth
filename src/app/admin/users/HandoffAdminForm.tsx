"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handoffDeptAdminAction } from "@/lib/actions/admin";
import { UserCog } from "lucide-react";

type Candidate = { id: string; fullName: string };

export default function HandoffAdminForm({ candidates }: { candidates: Candidate[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (candidates.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-none border border-dashed border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <UserCog size={15} /> Hand off department admin role
      </button>
    );
  }

  return (
    <form
      action={(fd) => {
        if (!confirm("You'll lose department admin access immediately. Continue?")) return;
        startTransition(async () => {
          await handoffDeptAdminAction(fd);
          router.push("/dashboard");
        });
      }}
      className="card-raised flex flex-wrap items-center gap-3 rounded-none p-4"
    >
      <UserCog size={16} className="text-ink-soft" />
      <p className="text-sm text-ink">Hand your department admin role to:</p>
      <select
        name="userId"
        required
        className="rounded-none border border-line bg-paper px-2.5 py-1.5 text-sm text-ink-soft"
        defaultValue=""
      >
        <option value="" disabled>
          Choose a member…
        </option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.fullName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-none bg-coral px-4 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Handing off…" : "Confirm handoff"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft hover:text-ink">
        Cancel
      </button>
    </form>
  );
}
