"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { togglePosterAction, toggleActiveAction } from "@/lib/actions/admin";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  title: string | null;
  programType: string | null;
  systemRole: string;
  isPoster: boolean;
  isActive: boolean;
  departmentId: string | null;
  deptName: string | null;
};

const PAGE_SIZE = 10;

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.title ?? "").toLowerCase().includes(q) ||
        (u.deptName ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-md border border-line bg-paper-raised px-3 py-2 sm:w-80">
        <Search size={14} className="text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members…"
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
        />
      </div>

      <div className="card-raised overflow-x-auto rounded-lg">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-soft text-xs uppercase tracking-wide text-ink-soft/70">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Poster</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u) => (
              <tr key={u.id} className="border-b border-line-soft last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{u.fullName}</p>
                  <p className="text-xs text-ink-soft">{u.title ?? u.email}</p>
                </td>
                <td className="px-5 py-3 text-ink-soft">{u.deptName ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="tag">{roleLabel(u.systemRole)}</span>
                </td>
                <td className="px-5 py-3 text-ink-soft">{u.isPoster ? "Yes" : "No"}</td>
                <td className="px-5 py-3">
                  <span className={u.isActive ? "text-sage" : "text-coral"}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {u.systemRole === "MEMBER" && (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => { togglePosterAction(u.id); })}
                        className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
                      >
                        {u.isPoster ? "Revoke poster" : "Grant poster"}
                      </button>
                    )}
                    {u.systemRole !== "SUPER_ADMIN" && (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => { toggleActiveAction(u.id); })}
                        className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-coral hover:text-coral disabled:opacity-60"
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-ink-soft">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="meta text-xs text-ink-soft">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function roleLabel(role: string) {
  return { SUPER_ADMIN: "Super Admin", DEPT_ADMIN: "Dept Admin", POSTER: "Poster", MEMBER: "Member" }[role] ?? role;
}
