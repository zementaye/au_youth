"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/format";

type Row = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: Date | string | null;
  actorId: string;
  actorName: string | null;
};

const PAGE_SIZE = 20;

export default function AuditLogTable({
  rows,
  actors,
  actions,
}: {
  rows: Row[];
  actors: string[];
  actions: string[];
}) {
  const [query, setQuery] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (actorFilter && r.actorName !== actorFilter) return false;
      if (actionFilter && r.action !== actionFilter) return false;
      if (!q) return true;
      return (
        (r.actorName ?? "").toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        (r.targetType ?? "").toLowerCase().includes(q) ||
        (r.details ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, actorFilter, actionFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, actorFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="card-raised flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-line bg-paper px-3 py-2">
          <Search size={14} className="text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, targets…"
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
          />
        </div>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-soft"
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-soft"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {actionLabel(a)}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-ink-soft/70 meta">
        {filtered.length} of {rows.length} entries
      </p>

      <div className="card-raised mt-3 divide-y divide-line-soft rounded-lg">
        {pageItems.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
            <span className="text-ink-soft">
              <span className="text-ink">{r.actorName ?? "Unknown"}</span> · {actionLabel(r.action)}
              {r.targetType && <span className="text-ink-soft/70"> ({r.targetType})</span>}
            </span>
            <span className="meta text-xs text-ink-soft/60">{formatDateTime(r.createdAt)}</span>
          </div>
        ))}
        {pageItems.length === 0 && <p className="px-5 py-6 text-center text-sm text-ink-soft">No matching entries.</p>}
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

function actionLabel(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}
