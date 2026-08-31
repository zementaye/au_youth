import Link from "next/link";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Pin, Users, MessagesSquare, LayoutGrid } from "lucide-react";
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
      {/* Hero — quiet, typography-led, a soft accent wash instead of any
          illustration */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-[0.35] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold-soft), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
          <p className="meta mb-5 flex items-center justify-center gap-2 text-xs font-medium">
            <span className="node-dot" /> African Union &middot; Youth Program
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl">
            Every department.
            <br />
            Every skill.
            <br />
            One place to find it.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-soft">
            A shared home for AU interns, volunteers, and fellows &mdash; see what&apos;s
            happening across departments, discover who can help with what, and get
            matched to the person with the skill you need.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              Join the network <ArrowRight size={15} />
            </Link>
            <Link
              href="/directory"
              className="flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30 hover:bg-line-soft"
            >
              Browse the skill directory
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <p className="font-display text-2xl font-semibold text-ink">{deptList.length}</p>
              <p className="meta text-xs">Departments</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-ink">{memberCount}</p>
              <p className="meta text-xs">Youth members</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-ink">{skillCount}</p>
              <p className="meta text-xs">Listed skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* What the platform does — three plain feature rows instead of an
          illustration */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <Feature
            icon={LayoutGrid}
            title="Stay in the loop"
            body="Platform-wide and department announcements in one feed, with pinned updates always on top."
          />
          <Feature
            icon={Users}
            title="Find who can help"
            body="Search the skill directory by department, program type, or the exact skill you're looking for."
          />
          <Feature
            icon={MessagesSquare}
            title="Ask, offer, resolve"
            body="Post a help request tagged with a skill — matching members are notified automatically."
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
                {p.pinned && <Pin size={12} className="text-coral" />}
                <span className="tag">{p.deptName ?? "Platform-wide"}</span>
              </div>
              <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:underline">
                {p.title}
              </h3>
              <p className="line-clamp-2 text-sm text-ink-soft">{p.body}</p>
              <p className="meta mt-auto pt-2 text-xs">
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

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-gold-soft text-gold">
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
