import Link from "next/link";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Pin } from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function LandingPage() {
  const [recentPosts, deptList, [{ memberCount }], [{ skillCount }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        pinned: posts.pinned,
        createdAt: posts.createdAt,
        authorName: users.fullName,
        deptName: departments.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(departments, eq(posts.departmentId, departments.id))
      .orderBy(desc(posts.pinned), desc(posts.createdAt))
      .limit(4),
    db.select().from(departments),
    db.select({ memberCount: users.id }).from(users).then((r) => [{ memberCount: r.length }]),
    db.select({ skillCount: skills.id }).from(skills).then((r) => [{ skillCount: r.length }]),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line-soft">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <p className="meta mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
              <span className="node-dot" /> African Union &middot; Youth Program
            </p>
            <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-6xl">
              Every department.
              <br />
              Every skill.
              <br />
              <span className="italic text-ink-soft">One network.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              A shared home for AU interns, volunteers, and fellows &mdash; find out what&apos;s
              happening across departments, discover who can help with what, and get
              matched to the person with the skill you need.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Join the network <ArrowRight size={15} />
              </Link>
              <Link
                href="/directory"
                className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                Browse the skill directory
              </Link>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line-soft pt-6">
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{deptList.length}</p>
                <p className="meta text-xs text-ink-soft">Departments</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{memberCount}</p>
                <p className="meta text-xs text-ink-soft">Youth members</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{skillCount}</p>
                <p className="meta text-xs text-ink-soft">Listed skills</p>
              </div>
            </div>
          </div>

          {/* Signature network visual */}
          <NetworkSignature departmentNames={deptList.map((d) => d.name)} />
        </div>
      </section>

      {/* Pinned / recent announcements */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Latest updates</h2>
          <Link href="/announcements" className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {recentPosts.map((p) => (
            <Link
              key={p.id}
              href="/announcements"
              className="card-raised group flex flex-col gap-2.5 rounded-lg p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                {p.pinned && <Pin size={12} className="text-coral" />}
                <span className="tag">{p.deptName ?? "Platform-wide"}</span>
              </div>
              <h3 className="font-display text-lg font-medium leading-snug text-ink group-hover:underline">
                {p.title}
              </h3>
              <p className="line-clamp-2 text-sm text-ink-soft">{p.body}</p>
              <p className="meta mt-auto pt-2 text-xs text-ink-soft/70">
                {p.authorName} &middot; {formatDate(p.createdAt)}
              </p>
            </Link>
          ))}
          {recentPosts.length === 0 && (
            <p className="text-sm text-ink-soft">No updates published yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function NetworkSignature({ departmentNames }: { departmentNames: string[] }) {
  const names = departmentNames.slice(0, 5);
  const cx = 210;
  const cy = 190;
  const radius = 140;
  const points = names.map((name, i) => {
    const angle = (i / names.length) * Math.PI * 2 - Math.PI / 2;
    return {
      name,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 420 380" className="w-full max-w-md" role="img" aria-label="Network diagram connecting AU departments">
        {points.map((p, i) => (
          <line
            key={`l-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--line)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}
        {points.map((p, i) =>
          points.slice(i + 1).map((q, j) => (
            <line
              key={`c-${i}-${j}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke="var(--line-soft)"
              strokeWidth={1}
            />
          ))
        )}
        <circle cx={cx} cy={cy} r={30} fill="var(--paper-raised)" stroke="var(--gold)" strokeWidth={1.5} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="font-display" fontSize="11" fill="var(--ink)">
          You
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--ink-soft)">
          + your skills
        </text>
        {points.map((p, i) => (
          <g key={`n-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill="var(--coral)" />
            <text
              x={p.x}
              y={p.y + (p.y > cy ? 18 : -12)}
              textAnchor="middle"
              fontSize="9.5"
              fill="var(--ink-soft)"
              fontFamily="var(--font-mono)"
            >
              {p.name.length > 16 ? p.name.slice(0, 14) + "…" : p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
