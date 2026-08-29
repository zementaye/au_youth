import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ScrollText } from "lucide-react";
import AuditLogTable from "./AuditLogTable";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.systemRole !== "SUPER_ADMIN") redirect("/admin");

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
      actorId: auditLogs.actorId,
      actorName: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(500);

  const actors = Array.from(new Set(rows.map((r) => r.actorName).filter(Boolean))) as string[];
  const actions = Array.from(new Set(rows.map((r) => r.action)));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
        <span className="node-dot" /> Admin panel
      </p>
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        <ScrollText size={26} /> Audit log
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Every admin action &mdash; who did it, to what, and when.
      </p>

      <div className="mt-8">
        <AuditLogTable rows={rows} actors={actors} actions={actions} />
      </div>
    </div>
  );
}
