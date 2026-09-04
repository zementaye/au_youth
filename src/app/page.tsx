import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, Pin } from "lucide-react";
import { formatDate } from "@/lib/format";
import NetworkDiagram from "@/components/NetworkDiagram";
import { accentFor } from "@/lib/accent";
import PeopleBand from "@/components/PeopleBand";
import HeroBlobs from "@/components/HeroBlobs";
import HeroFloatingShapes from "@/components/HeroFloatingShapes";
import CountUp from "@/components/CountUp";
import MarqueeTicker from "@/components/MarqueeTicker";
import FlagPanel from "@/components/FlagPanel";

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
      {/* Hero — oversized, run-together headline and a drifting field of
          color blobs instead of a quiet data-panel hero. The network stats
          still lead with real numbers, just louder about it. */}
      <section className="relative overflow-hidden bg-brand-soft">
        <HeroBlobs />
        <HeroFloatingShapes>
        <div className="relative z-10 mx-auto max-w-5xl px-5 pb-14 pt-20 text-center sm:pt-28">
          <p className="animate-rise mb-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">
            African Union · Youth Network
          </p>
          <h1 className="animate-rise display-huge text-[15vw] text-ink sm:text-[6.5rem]" style={{ "--delay": "80ms" } as CSSProperties}>
            <span className="block">Find</span>
            <span className="block text-brand">Your</span>
            <span className="block text-marigold">People.</span>
          </h1>
          <p
            className="animate-rise mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg"
            style={{ "--delay": "160ms" } as CSSProperties}
          >
            Every intern, volunteer, and fellow across the African Union — searchable
            by skill, posting updates, asking for and giving help. Not a directory.
            A network.
          </p>
          <div
            className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ "--delay": "220ms" } as CSSProperties}
          >
            <Link
              href="/signup"
              className="tap flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper hover:bg-brand"
            >
              Join the network <ArrowRight size={16} />
            </Link>
            <Link
              href="/directory"
              className="tap flex items-center gap-2 bg-marigold px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink hover:opacity-90"
            >
              See who&apos;s in it
            </Link>
          </div>

          <dl
            className="animate-rise mx-auto mt-14 flex max-w-md flex-wrap justify-center gap-x-12 gap-y-4"
            style={{ "--delay": "280ms" } as CSSProperties}
          >
            <div>
              <dt className="meta text-xs">Departments</dt>
              <dd className="font-display text-3xl font-bold text-ink">
                <CountUp value={deptCounts.length} />
              </dd>
            </div>
            <div>
              <dt className="meta text-xs">Youth members</dt>
              <dd className="font-display text-3xl font-bold text-ink">
                <CountUp value={memberCount} />
              </dd>
            </div>
            <div>
              <dt className="meta text-xs">Listed skills</dt>
              <dd className="font-display text-3xl font-bold text-ink">
                <CountUp value={skillCount} />
              </dd>
            </div>
          </dl>
        </div>
        </HeroFloatingShapes>
      </section>

      <MarqueeTicker background="var(--ink)" color="var(--paper)" />
      <FlagPanel labels={deptCounts.slice(0, 8).map((d) => d.name ?? "")} />

      {/* Abstract community illustration — not stock photography (a real
          identifiable person can't be sourced or licensed sight-unseen for
          this), but flat-color figures in the site's own visual language,
          standing in for the people the diagram counts. */}
      <section className="border-b border-line bg-paper-raised py-14">
        <div className="mx-auto max-w-5xl px-5">
          <p className="mb-8 text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            One network. Every department.
          </p>
          <PeopleBand />
        </div>
      </section>

      {/* This section is transparent on purpose — it reveals the site-wide
          photo backdrop from layout.tsx (same image, one shared request)
          rather than loading its own copy. A lighter ink gradient keeps
          the headline readable while the photo stays clearly visible. */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-b from-ink/20 via-ink/35 to-ink/20 py-24">
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <p className="font-display text-3xl font-bold text-paper sm:text-4xl">
            Built by the people it&apos;s for.
          </p>
          <p className="mx-auto mt-3 max-w-md text-base text-paper/80">
            Interns, volunteers, and fellows across every AU department — this is
            their network.
          </p>
        </div>
      </section>

      {/* What happens on each part of the platform, told through the
          actions a member takes rather than abstract feature names. */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          <HowItWorks
            step="Post an update"
            body="Share news with your whole department, or the entire network. Pinned updates stay at the top of the feed."
            color="var(--marigold)"
            delay={0}
          />
          <HowItWorks
            step="List your skills"
            body="Add what you're good at to your profile. Anyone searching the directory for that skill finds you."
            color="var(--emerald)"
            delay={90}
          />
          <HowItWorks
            step="Ask for help"
            body="Tag a request with the skill you need. Everyone who has it gets notified automatically."
            color="var(--royal)"
            delay={180}
          />
        </div>
      </section>

      {/* The network diagram gets its own dedicated moment instead of
          sharing the hero — real department/member data, drawn in live. */}
      <section className="border-t border-line bg-ink py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="font-display text-2xl font-bold text-paper sm:text-3xl">See the network</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-paper/60">
            Every department, sized by how many members it has right now.
          </p>
          <div className="mx-auto mt-8 w-full max-w-md">
            <NetworkDiagram
              departments={deptCounts.map((d) => ({ name: d.name ?? "Unassigned", count: Number(d.count) }))}
            />
          </div>
        </div>
      </section>

      {/* Pinned / recent announcements — one featured post carries the
          section, the rest read as a dated list rather than four identical
          boxed cards competing for the same attention. */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Latest updates</h2>
          <Link href="/announcements" className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Quiet so far — be the first to post something the network should know.
          </p>
        ) : (
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[1.3fr_1fr]">
            {(() => {
              const [featured, ...rest] = recentPosts;
              return (
                <>
                  <Link
                    href="/announcements"
                    className="animate-rise group block border-t-[3px] pt-5"
                    style={{ borderTopColor: accentFor(featured.deptName) }}
                  >
                    <div className="flex items-center gap-2 text-xs text-ink-soft">
                      {featured.pinned && <Pin size={12} className="text-brick" />}
                      <span className="font-medium" style={{ color: accentFor(featured.deptName) }}>
                        {featured.deptName ?? "Platform-wide"}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink group-hover:underline">
                      {featured.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{featured.body}</p>
                    <p className="meta mt-4 text-xs">
                      {featured.authorName} — {formatDate(featured.createdAt)}
                    </p>
                  </Link>

                  <div className="divide-y divide-line-soft border-t border-line-soft lg:border-t-0">
                    {rest.map((p, i) => (
                      <Link
                        key={p.id}
                        href="/announcements"
                        className="animate-rise group flex items-start gap-3 py-4"
                        style={{ "--delay": `${(i + 1) * 60}ms` } as CSSProperties}
                      >
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0"
                          style={{ background: accentFor(p.deptName) }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-ink-soft">
                            {p.pinned && <Pin size={11} className="text-brick" />}
                            <span className="font-medium text-ink-soft">
                              {p.deptName ?? "Platform-wide"}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-base font-semibold leading-snug text-ink group-hover:underline">
                            {p.title}
                          </h3>
                          <p className="meta mt-1 text-xs">
                            {p.authorName} — {formatDate(p.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </section>

      {/* Closing statement — a bold, single line before the footer, the way
          a movement site closes on conviction rather than more links. A
          slow-moving multi-hue sweep (the site's own accent colors, not a
          generic rainbow) instead of a flat fill — the one place on the
          page that gets an ongoing color animation, kept to this single
          moment rather than scattered everywhere. */}
      <section
        className="animate-gradient-sweep py-14 text-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, var(--marigold) 0%, var(--terracotta) 20%, var(--brick) 40%, var(--royal) 60%, var(--brand) 80%, var(--marigold) 100%)",
        }}
      >
        <p className="display-huge text-3xl text-paper drop-shadow-sm sm:text-4xl">The network doesn&apos;t wait.</p>
      </section>
    </div>
  );
}

function HowItWorks({ step, body, color, delay }: { step: string; body: string; color: string; delay: number }) {
  return (
    <div className="animate-rise border-l-2 pl-4" style={{ "--delay": `${delay}ms`, borderLeftColor: color } as CSSProperties}>
      <h3 className="font-display text-base font-semibold text-ink">{step}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
