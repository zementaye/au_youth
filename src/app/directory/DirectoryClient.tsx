"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Link2, FolderGit2, Globe, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import Dot from "@/components/Dot";

type Member = {
  id: string;
  fullName: string;
  title: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  programType: string | null;
  departmentId: string | null;
  deptName: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  portfolio: string | null;
  phone: string | null;
  email: string;
  skills: { name: string; proficiency: string }[];
};

const PAGE_SIZE = 12;

export default function DirectoryClient({
  members,
  departments,
  skillNames,
  isLoggedIn,
}: {
  members: Member[];
  departments: { id: string; name: string }[];
  skillNames: string[];
  isLoggedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (deptFilter && m.departmentId !== deptFilter) return false;
      if (programFilter && m.programType !== programFilter) return false;
      if (!q) return true;
      const skillMatch = m.skills.some((s) => s.name.toLowerCase().includes(q));
      const nameMatch = m.fullName.toLowerCase().includes(q);
      const titleMatch = (m.title ?? "").toLowerCase().includes(q);
      return skillMatch || nameMatch || titleMatch;
    });
  }, [members, query, deptFilter, programFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, deptFilter, programFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="card-raised flex flex-col gap-3 rounded-none p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-none border border-line bg-paper px-3 py-2">
          <Search size={15} className="text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skill, name, or title…"
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
            list="skill-suggestions"
          />
          <datalist id="skill-suggestions">
            {skillNames.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-none border border-line bg-paper px-3 py-2 text-sm text-ink-soft"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="rounded-none border border-line bg-paper px-3 py-2 text-sm text-ink-soft"
        >
          <option value="">All programs</option>
          <option value="INTERN">Intern</option>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="FELLOW">Fellow</option>
        </select>
      </div>

      <p className="mt-4 text-xs text-ink-soft/70 meta">
        {filtered.length} of {members.length} members
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((m) => (
          <div key={m.id} className="card-raised flex flex-col gap-3 rounded-none p-5">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line bg-paper">
                {m.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium text-ink-soft/50">
                    {initials(m.fullName)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-display text-lg font-medium leading-snug text-ink">{m.fullName}</p>
                <p className="text-xs text-ink-soft">
                  {m.title ?? "Member"}
                  {m.deptName && (
                    <>
                      <Dot /> {m.deptName}
                    </>
                  )}
                </p>
                {m.programType && <span className="tag mt-2 inline-block">{titleCase(m.programType)}</span>}
              </div>
            </div>
            {m.bio && <p className="line-clamp-3 text-sm text-ink-soft">{m.bio}</p>}
            {m.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.skills.map((s) => (
                  <span key={s.name} className="tag">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
            {isLoggedIn ? (
              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line-soft pt-3 text-ink-soft">
                <a href={`mailto:${m.email}`} aria-label="Email" className="hover:text-ink">
                  <Mail size={16} />
                </a>
                {m.phone && (
                  <a href={`tel:${m.phone}`} aria-label="Phone" className="hover:text-ink">
                    <Phone size={16} />
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-ink">
                    <Link2 size={16} />
                  </a>
                )}
                {m.github && (
                  <a href={m.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-ink">
                    <FolderGit2 size={16} />
                  </a>
                )}
                {m.portfolio && (
                  <a href={m.portfolio} target="_blank" rel="noreferrer" aria-label="Portfolio" className="hover:text-ink">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-auto border-t border-line-soft pt-3 text-xs text-ink-soft/70">
                <Link href="/login" className="underline">
                  Sign in
                </Link>{" "}
                to see contact info
              </p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-ink-soft">No members match those filters.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-none border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="meta text-xs text-ink-soft">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-none border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
