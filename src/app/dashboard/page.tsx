import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, canPost } from "@/lib/auth";
import { db } from "@/db";
import { helpRequests, userSkills, skills } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { Settings, ArrowRight } from "lucide-react";
import VerifyBanner from "@/components/VerifyBanner";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [mySkillRows, myRequests] = await Promise.all([
    db
      .select({ name: skills.name, proficiency: userSkills.proficiency })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, user.id)),
    db
      .select()
      .from(helpRequests)
      .where(or(eq(helpRequests.requestedById, user.id), eq(helpRequests.claimedById, user.id))),
  ]);

  const submitted = myRequests.filter((r) => r.requestedById === user.id);
  const helping = myRequests.filter((r) => r.claimedById === user.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {!user.emailVerified && <VerifyBanner />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
            <span className="node-dot" /> Your dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {user.title ?? "Member"} {user.departmentName ? `· ${user.departmentName}` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink"
        >
          <Settings size={14} /> Edit profile
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <StatCard label="Your role" value={roleLabel(user.systemRole)} />
        <StatCard label="Posting privileges" value={canPost(user) ? "Yes" : "Not yet"} />
        <StatCard label="Skills listed" value={String(mySkillRows.length)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {mySkillRows.map((s) => (
          <span key={s.name} className="tag">
            {s.name}
          </span>
        ))}
        {mySkillRows.length === 0 && (
          <p className="text-sm text-ink-soft">
            You haven&apos;t added any skills yet.{" "}
            <Link href="/dashboard/profile" className="underline">
              Add some
            </Link>{" "}
            so people can find you.
          </p>
        )}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-medium text-ink">My help requests</h2>
            <Link href="/help-requests" className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
              Help board <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {submitted.map((r) => (
              <div key={r.id} className="card-raised rounded-lg p-4">
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <p className="mt-1 text-xs text-ink-soft">{statusLabel(r.status)}</p>
              </div>
            ))}
            {submitted.length === 0 && <p className="text-sm text-ink-soft">You haven&apos;t submitted any requests.</p>}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-medium text-ink">Requests I&apos;m helping with</h2>
          </div>
          <div className="space-y-3">
            {helping.map((r) => (
              <div key={r.id} className="card-raised rounded-lg p-4">
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <p className="mt-1 text-xs text-ink-soft">{statusLabel(r.status)}</p>
              </div>
            ))}
            {helping.length === 0 && <p className="text-sm text-ink-soft">You haven&apos;t claimed any requests yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-raised rounded-lg p-4">
      <p className="meta text-xs text-ink-soft/70">{label}</p>
      <p className="mt-1 font-display text-xl font-medium text-ink">{value}</p>
    </div>
  );
}

function roleLabel(role: string) {
  return { SUPER_ADMIN: "Super Admin", DEPT_ADMIN: "Department Admin", POSTER: "Poster", MEMBER: "Member" }[role] ?? role;
}

function statusLabel(status: string) {
  return { OPEN: "Open", CLAIMED: "Claimed — in progress", RESOLVED: "Resolved" }[status] ?? status;
}
