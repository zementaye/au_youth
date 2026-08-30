import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { departments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import CreateDepartmentForm from "./CreateDepartmentForm";
import AssignAdminForm from "./AssignAdminForm";

export default async function AdminDepartmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.systemRole !== "SUPER_ADMIN") redirect("/admin");

  const [deptRows, memberRows] = await Promise.all([
    db.select().from(departments),
    db
      .select({ id: users.id, fullName: users.fullName, departmentId: users.departmentId })
      .from(users)
      .where(eq(users.isActive, true)),
  ]);

  const adminNameById = new Map(memberRows.map((m) => [m.id, m.fullName]));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
        <span className="node-dot" /> Admin panel
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Departments
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Create sectors and assign a Department Admin to manage each one.
      </p>

      <div className="mt-8">
        <CreateDepartmentForm />
      </div>

      <div className="mt-10 space-y-4">
        {deptRows.map((d) => (
          <div key={d.id} className="card-raised rounded-none p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-medium text-ink">{d.name}</p>
                {d.description && <p className="mt-1 text-sm text-ink-soft">{d.description}</p>}
                <p className="mt-2 text-xs text-ink-soft/70 meta">
                  Admin: {d.deptAdminId ? adminNameById.get(d.deptAdminId) ?? "Unknown" : "Not assigned"}
                </p>
              </div>
              <AssignAdminForm
                departmentId={d.id}
                members={memberRows.filter((m) => m.departmentId === d.id)}
              />
            </div>
          </div>
        ))}
        {deptRows.length === 0 && <p className="text-sm text-ink-soft">No departments yet.</p>}
      </div>
    </div>
  );
}
