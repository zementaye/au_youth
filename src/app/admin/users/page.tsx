import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users, departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import UsersTable from "./UsersTable";
import HandoffAdminForm from "./HandoffAdminForm";

export const metadata: Metadata = {
  title: "Manage members",
  description: "Grant posting privileges and manage member accounts.",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.systemRole !== "SUPER_ADMIN" && user.systemRole !== "DEPT_ADMIN") redirect("/dashboard");

  const isSuper = user.systemRole === "SUPER_ADMIN";

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      title: users.title,
      programType: users.programType,
      systemRole: users.systemRole,
      isPoster: users.isPoster,
      isActive: users.isActive,
      departmentId: users.departmentId,
      deptName: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(isSuper ? undefined : eq(users.departmentId, user.departmentId ?? ""));

  const handoffCandidates = rows.filter(
    (r) => r.id !== user.id && r.isActive && r.systemRole !== "SUPER_ADMIN"
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Admin panel
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {isSuper ? "All members" : `${user.departmentName ?? "Department"} members`}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Grant posting privileges, or deactivate an account after the fact if needed.
      </p>

      {!isSuper && (
        <div className="mt-8">
          <HandoffAdminForm candidates={handoffCandidates.map((c) => ({ id: c.id, fullName: c.fullName }))} />
        </div>
      )}

      <div className="mt-8">
        <UsersTable users={rows} />
      </div>
    </div>
  );
}
