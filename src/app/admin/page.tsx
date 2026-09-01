import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, departments, helpRequests, userSkills, skills, auditLogs } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { Building2, Users as UsersIcon, MessageSquare, ScrollText, ArrowRight, Mail } from "lucide-react";
import { MembersByDeptChart, TopSkillsChart, HelpRequestStatusChart } from "./AdminCharts";
import { formatDateTime } from "@/lib/format";
import Dot from "@/components/Dot";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.systemRole !== "SUPER_ADMIN" && user.systemRole !== "DEPT_ADMIN") redirect("/dashboard");

  const isSuper = user.systemRole === "SUPER_ADMIN";
  const deptScope = isSuper ? undefined : user.departmentId ?? undefined;

  const [memberCountByDept, resolvedCount, openCount, topSkills, recentAudit] = await Promise.all([
    db
      .select({ deptName: departments.name, count: sql<number>`count(${users.id})` })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .groupBy(departments.name),
    db.select({ count: sql<number>`count(*)` }).from(helpRequests).where(
      deptScope
        ? and(eq(helpRequests.status, "RESOLVED"), eq(helpRequests.departmentId, deptScope))
        : eq(helpRequests.status, "RESOLVED")
    ),
    db.select({ count: sql<number>`count(*)` }).from(helpRequests).where(
      deptScope
        ? and(eq(helpRequests.status, "OPEN"), eq(helpRequests.departmentId, deptScope))
        : eq(helpRequests.status, "OPEN")
    ),
    db
      .select({ name: skills.name, count: sql<number>`count(${userSkills.userId})` })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .groupBy(skills.name)
      .orderBy(desc(sql`count(${userSkills.userId})`))
      .limit(6),
    isSuper
      ? db
          .select({
            id: auditLogs.id,
            action: auditLogs.action,
            targetType: auditLogs.targetType,
            createdAt: auditLogs.createdAt,
            actorName: users.fullName,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.actorId, users.id))
          .orderBy(desc(auditLogs.createdAt))
          .limit(5)
      : Promise.resolve([]),
  ]);

  const deptChartData = memberCountByDept
    .map((d) => ({ name: d.deptName ?? "Unassigned", count: Number(d.count) }))
    .sort((a, b) => b.count - a.count);
  const skillsChartData = topSkills.map((s) => ({ name: s.name ?? "Unnamed", count: Number(s.count) }));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Admin panel
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {isSuper ? "Platform overview" : `${user.departmentName ?? "Department"} overview`}
      </h1>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminLink href="/admin/users" icon={UsersIcon} label="Manage users" />
        {isSuper && <AdminLink href="/admin/departments" icon={Building2} label="Manage departments" />}
        {isSuper && <AdminLink href="/admin/outbox" icon={Mail} label="Dev email outbox" />}
        <AdminLink href="/help-requests" icon={MessageSquare} label="Help request board" />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <StatCard label="Open help requests" value={String(openCount[0]?.count ?? 0)} />
        <StatCard label="Resolved help requests" value={String(resolvedCount[0]?.count ?? 0)} />
        <StatCard label="Departments" value={isSuper ? String(memberCountByDept.length) : "—"} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {isSuper && (
          <div>
            <h2 className="mb-3 font-display text-xl font-medium text-ink">Members per department</h2>
            <div className="card-raised rounded-lg p-4">
              <MembersByDeptChart data={deptChartData} />
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-display text-xl font-medium text-ink">Help request status</h2>
          <div className="card-raised rounded-lg p-4">
            <HelpRequestStatusChart open={Number(openCount[0]?.count ?? 0)} resolved={Number(resolvedCount[0]?.count ?? 0)} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-xl font-medium text-ink">Most listed skills</h2>
        <div className="card-raised rounded-lg p-4">
          <TopSkillsChart data={skillsChartData} />
        </div>
      </div>

      {isSuper && (
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText size={16} className="text-ink-soft" />
              <h2 className="font-display text-xl font-medium text-ink">Recent admin activity</h2>
            </div>
            <Link href="/admin/audit" className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
              Full audit log <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-raised divide-y divide-line-soft rounded-lg">
            {recentAudit.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-ink-soft">
                  <span className="text-ink">{a.actorName}</span> <Dot /> {actionLabel(a.action)}
                </span>
                <span className="meta text-xs text-ink-soft/60">{formatDateTime(a.createdAt)}</span>
              </div>
            ))}
            {recentAudit.length === 0 && <p className="px-5 py-3 text-sm text-ink-soft">No admin actions yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLink({ href, icon: Icon, label }: { href: string; icon: typeof UsersIcon; label: string }) {
  return (
    <Link href={href} className="card-raised flex items-center justify-between rounded-lg p-4 text-sm text-ink hover:shadow-sm">
      <span className="flex items-center gap-2">
        <Icon size={16} className="text-ink-soft" /> {label}
      </span>
      <ArrowRight size={14} className="text-ink-soft" />
    </Link>
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

function actionLabel(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}
