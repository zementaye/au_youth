import Link from "next/link";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Pin } from "lucide-react";
import { formatDate } from "@/lib/format";

const ACCENTS = ["var(--sage)", "var(--gold)", "var(--coral)", "var(--forest)"];

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
      <section className="relative overflow-hidden border-b border-ink">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-2 text-sage">
              <span className="h-2 w-2" style={{ background: "var(--sage)" }} /> African Union
              &nbsp;·&nbsp; Youth Program
            </p>
            <h1 className="font-display text-[2.75rem] leading-[1.02] font-semibold tracking-tight text-ink sm:text-6xl">
              Every department.
              <br />
              Every skill.
              <br />
              <span className="relative inline-block">
                One network.
                <span
                  className="absolute -bottom-1 left-0 h-2 w-full"
                  style={{ background: "var(--gold)", zIndex: -1 }}
                />
              </span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-ink-soft">
              A shared home for AU interns, volunteers, and fellows &mdash; find out what&apos;s
              happening across departments, discover who can help with what, and get
              matched to the person with the skill you need.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn btn-primary">
                Join the network <ArrowRight size={15} />
              </Link>
              <Link href="/directory" className="btn btn-outline">
                Browse the skill directory
              </Link>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-3 gap-0 border border-ink">
              <Stat label="Departments" value={deptList.length} border />
              <Stat label="Youth members" value={memberCount} border />
              <Stat label="Listed skills" value={skillCount} />
            </div>
          </div>

          {/* Signature: woven department strip */}
          <NetworkSignature departmentNames={deptList.map((d) => d.name)} />
        </div>
      </section>

      {/* Pinned / recent announcements */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-baseline justify-between border-b border-ink pb-3">
          <h2 className="font-display text-2xl font-semibold text-ink">Latest updates</h2>
          <Link href="/announcements" className="eyebrow flex items-center gap-1 text-ink-soft hover:text-ink">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {recentPosts.map((p) => (
            <Link
              key={p.id}
              href="/announcements"
              className="card-raised group flex flex-col gap-2.5 p-5 transition-transform hover:-translate-y-0.5"
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

function Stat({ label, value, border }: { label: string; value: number; border?: boolean }) {
  return (
    <div className={`p-4 ${border ? "border-r border-ink" : ""}`}>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="meta text-[0.65rem] uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

/* Signature element: departments rendered as a woven strip — bands of
   colour joined edge to edge, the way strip-woven cloth is built from
   individually loomed bands. A "YOU" tile stitches into the weave to
   represent joining the network, rather than a radial hub-and-spoke
   diagram. */
function NetworkSignature({ departmentNames }: { departmentNames: string[] }) {
  const names = departmentNames.slice(0, 6);

  return (
    <div className="flex flex-col justify-center gap-0 self-stretch border border-ink">
      {names.map((name, i) => (
        <div
          key={name}
          className="flex items-stretch border-b border-ink last:border-b-0"
          style={{ height: "44px" }}
        >
          <div
            className="flex w-2.5 shrink-0 items-center justify-center"
            style={{ background: ACCENTS[i % ACCENTS.length] }}
          />
          <div className="flex flex-1 items-center justify-between gap-3 px-4">
            <span className="font-display text-sm font-medium text-ink">{name}</span>
            <span className="meta text-[0.65rem] text-ink-soft/60">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      ))}
      {names.length === 0 && (
        <p className="p-5 text-sm text-ink-soft">Departments will appear here once added.</p>
      )}
      <div className="flex items-stretch bg-ink">
        <div className="flex w-2.5 shrink-0 items-center justify-center bg-paper" />
        <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
          <span className="font-display text-sm font-semibold text-paper">+ your skills</span>
          <span className="meta text-[0.65rem] text-paper/60">You</span>
        </div>
      </div>
    </div>
  );
}
