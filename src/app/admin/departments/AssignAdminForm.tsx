"use client";

import { useTransition } from "react";
import { assignDeptAdminAction } from "@/lib/actions/admin";

type Member = { id: string; fullName: string };

export default function AssignAdminForm({
  departmentId,
  members,
}: {
  departmentId: string;
  members: Member[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => { assignDeptAdminAction(fd); })}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="departmentId" value={departmentId} />
      <select
        name="userId"
        required
        disabled={members.length === 0}
        className="rounded-none border border-line bg-paper px-2.5 py-1.5 text-xs text-ink-soft"
        defaultValue=""
      >
        <option value="" disabled>
          {members.length === 0 ? "No members yet" : "Assign admin…"}
        </option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending || members.length === 0}
        className="rounded-none border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
      >
        Assign
      </button>
    </form>
  );
}
