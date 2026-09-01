import Link from "next/link";
import { db } from "@/db";
import { posts, users, departments, skills } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, Pin, Megaphone, Sparkles, HandHelping, type LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import NetworkDiagram from "@/components/NetworkDiagram";
import { deptColor } from "@/lib/deptColor";

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
          with what the platform does for one person, not a tagline.
          Three deliberate departures from the rest of the site, chosen
          instead of a little of everything:
            1. Motion — NetworkDiagram plays its one load-in sequence here.
            2. Texture — a faint route-line pattern grounds the whole
               section in the network idea, not just the diagram; plus a
               soft marigold glow anchored specifically behind the hub
               (not a generic decorative wash).
            3. Scale/contrast — a bigger, asymmetric headline, and the
               diagram is allowed to sit larger than its column and drift
               below the section's own border instead of staying boxed in. */}
      <section className="relative border-b border-line">
        <HeroTexture />
        {/* Bold offset color panel — sharp corners (matches the structural
            shape rule), rotated slightly, bleeding off the left edge. This
            is the "bolder background" pass: a real color shape behind the
            copy, not a gradient wash, and not confined neatly inside the
            hero box. */}
        <div
          aria-hidden
          className="absolute -left-24 top-10 -z-10 h-72 w-[36rem] rotate-[-3deg] bg-indigo-soft opacity-70"
        />
        <div
          aria-hidden
          className="absolute -left-10 bottom-0 -z-10 h-40 w-64 rotate-[4deg] bg-marigold-soft opacity-80"
        />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:py-24">
          <div>
            <p className="meta mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <span className="node-dot" /> AU Youth Network
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Find the person who
              <br />
              already knows how to
              <br />
              <span className="text-marigold">fix this.</span>
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
                className="group flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all hover:-translate-y-0.5 hover:bg-marigold hover:text-ink hover:shadow-lg"
              >
                Create your profile
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/directory"
                className="flex items-center gap-2 border border-line px-5 py-2.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
              >
                See who&apos;s on the network
              </Link>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
              <div>
                <dt className="meta text-xs">Departments</dt>
                <dd className="font-display text-3xl font-semibold text-marigold">{deptCounts.length}</dd>
              </div>
              <div>
                <dt className="meta text-xs">Youth members</dt>
                <dd className="font-display text-3xl font-semibold text-indigo">{memberCount}</dd>
              </div>
              <div>
                <dt className="meta text-xs">Listed skills</dt>
                <dd className="font-display text-3xl font-semibold text-brick">{skillCount}</dd>
              </div>
            </dl>
          </div>

          {/* Sized past its old max-w-md and nudged down on larger screens
              so it visually crosses the section's own border-b instead of
              sitting neatly inside the hero box — the one deliberate break
              from the strict grid. translate is purely visual (no reflow),
              so it can't disturb the "How it works" section below it. */}
          <div className="relative mx-auto w-full max-w-lg md:translate-y-10 lg:translate-y-14">
            <div
              aria-hidden
              className="absolute inset-8 -z-10 rounded-full opacity-60 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--marigold-soft) 0%, transparent 68%)" }}
            />
            <NetworkDiagram
              departments={deptCounts.map((d) => ({ name: d.name ?? "Unassigned", count: Number(d.count) }))}
            />
          </div>
        </div>
      </section>

      {/* What happens on each part of the platform, told through the
          actions a member takes rather than abstract feature names. */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <HowItWorks
            step="Post an update"
            body="Share news with your whole department, or the entire network. Pinned updates stay at the top of the feed."
            icon={Megaphone}
            color="marigold"
            index={1}
          />
          <HowItWorks
            step="List your skills"
            body="Add what you're good at to your profile. Anyone searching the directory for that skill finds you."
            icon={Sparkles}
            color="indigo"
            index={2}
          />
          <HowItWorks
            step="Ask for help"
            body="Tag a request with the skill you need. Everyone who has it gets notified automatically."
            icon={HandHelping}
            color="brick"
            index={3}
          />
        </div>
      </section>

      {/* Pinned / recent announcements */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Latest updates</h2>
          <Link
            href="/announcements"
            className="group flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {recentPosts.map((p, i) => {
            const color = deptColor(p.deptName);
            return (
              <Link
                key={p.id}
                href="/announcements"
                className={`card-raised group flex flex-col gap-2.5 border-l-4 p-5 transition-all hover:-translate-y-1 hover:rotate-[-0.3deg] hover:shadow-lg ${color.edge}`}
                style={{ animation: `rise-in 520ms cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 90}ms both` }}
              >
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  {p.pinned && <Pin size={12} className="text-brick" />}
                  <span className={`tag ${color.chip}`}>{p.deptName ?? "Platform-wide"}</span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:underline">
                  {p.title}
                </h3>
                <p className="line-clamp-2 text-sm text-ink-soft">{p.body}</p>
                <p className="meta mt-auto pt-2 text-xs">
                  {p.authorName} — {formatDate(p.createdAt)}
                </p>
              </Link>
            );
          })}
          {recentPosts.length === 0 && (
            <p className="text-sm text-ink-soft">
              Quiet in here so far — be the first to post something the network should know.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// Faint tiled route lines across the entire hero background — the same
// "connection" idea as NetworkDiagram's spokes, just ambient rather than
// literal data. Kept to low opacity so body text stays fully legible; not
// meant to be looked at directly, just felt.
function HeroTexture() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="hero-routes" width="76" height="76" patternUnits="userSpaceOnUse" patternTransform="rotate(6)">
          <circle cx="6" cy="6" r="1.6" fill="var(--indigo)" opacity="0.3" />
          <path d="M6 6 L68 6" stroke="var(--indigo)" strokeWidth="1" opacity="0.12" />
          <path d="M6 6 L6 68" stroke="var(--indigo)" strokeWidth="1" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-routes)" />
    </svg>
  );
}

const HOW_IT_WORKS_COLORS = {
  marigold: { chip: "bg-marigold text-ink", edge: "border-l-marigold", num: "text-marigold" },
  indigo: { chip: "bg-indigo text-paper", edge: "border-l-indigo", num: "text-indigo" },
  brick: { chip: "bg-brick text-paper", edge: "border-l-brick", num: "text-brick" },
} as const;

function HowItWorks({
  step,
  body,
  icon: Icon,
  color,
  index,
}: {
  step: string;
  body: string;
  icon: LucideIcon;
  color: "marigold" | "indigo" | "brick";
  index: number;
}) {
  const c = HOW_IT_WORKS_COLORS[color];
  return (
    <div
      className={`card-raised group flex flex-col gap-3 border-l-4 p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${c.edge}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${c.chip}`}>
          <Icon size={16} />
        </span>
        <span className={`font-mono text-xs font-medium ${c.num}`}>0{index}</span>
      </div>
      <div>
        <h3 className="font-display text-base font-semibold text-ink">{step}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
