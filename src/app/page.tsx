import Link from "next/link";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, Pin } from "lucide-react";
import { formatDate } from "@/lib/format";
import NetworkDiagram from "@/components/NetworkDiagram";

export default async function LandingPage() {
  const [recentPosts, deptCounts, [{ skillCount }]] = await Promise.all([
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
    db
      .select({ name: departments.name, count: sql<number>`count(${users.id})` })
      .from(departments)
      .leftJoin(users, eq(users.departmentId, departments.id))
      .groupBy(departments.name)
      .orderBy(desc(sql`count(${users.id})`)),
    db.select({ skillCount: skills.id }).from(skills).then((r) => [{ skillCount: r.length }]),
  ]);

  const memberCount = deptCounts.reduce((sum, d) => sum + Number(d.count), 0);

  return (
    <div>
      {/* Hero — the diagram is real data, not an illustration; copy leads
          with what the platform does for one person, not a tagline. */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Find the person who
              <br />
              already knows how to
              <br />
              fix this.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              AU Youth Network connects interns, volunteers, and fellows across
              every department. Post what you need help with, search the
              directory by skill, and get matched to someone who can actually
              help.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-marigold hover:text-ink"
              >
                Create your profile <ArrowRight size={15} />
              </Link>
              <Link
                href="/directory"
                className="flex items-center gap-2 border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                See who&apos;s on the network
              </Link>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
              <div>
                <dt className="meta text-xs">Departments</dt>
                <dd className="font-display text-2xl font-semibold text-ink">{deptCounts.length}</dd>
              </div>
              <div>
                <dt className="meta text-xs">Youth members</dt>
                <dd className="font-display text-2xl font-semibold text-ink">{memberCount}</dd>
              </div>
              <div>
                <dt className="meta text-xs">Listed skills</dt>
                <dd className="font-display text-2xl font-semibold text-ink">{skillCount}</dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto w-full max-w-md">
            <NetworkDiagram
              departments={deptCounts.map((d) => ({ name: d.name ?? "Unassigned", count: Number(d.count) }))}
            />
          </div>
        </div>
      </section>

      {/* What happens on each part of the platform, told through the
          actions a member takes rather than abstract feature names. */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          <HowItWorks
            step="Post an update"
            body="Share news with your whole department, or the entire network. Pinned updates stay at the top of the feed."
          />
          <HowItWorks
            step="List your skills"
            body="Add what you're good at to your profile. Anyone searching the directory for that skill finds you."
          />
          <HowItWorks
            step="Ask for help"
            body="Tag a request with the skill you need. Everyone who has it gets notified automatically."
          />
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
              className="card-raised group flex flex-col gap-2.5 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                {p.pinned && <Pin size={12} className="text-brick" />}
                <span className="tag">{p.deptName ?? "Platform-wide"}</span>
              </div>
              <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:underline">
                {p.title}
              </h3>
              <p className="line-clamp-2 text-sm text-ink-soft">{p.body}</p>
              <p className="meta mt-auto pt-2 text-xs">
                {p.authorName} — {formatDate(p.createdAt)}
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

function HowItWorks({ step, body }: { step: string; body: string }) {
  return (
    <div className="border-l-2 border-marigold pl-4">
      <h3 className="font-display text-base font-semibold text-ink">{step}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
