import { db } from "@/db";
import { helpRequests, users, departments, skills, helpRequestSkills } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser, isDeptAdminOf } from "@/lib/auth";
import HelpRequestComposer from "./HelpRequestComposer";
import HelpRequestList from "./HelpRequestList";

export default async function HelpRequestsPage() {
  const [user, requestRows, skillList, reqSkillRows] = await Promise.all([
    getCurrentUser(),
    db
      .select({
        id: helpRequests.id,
        title: helpRequests.title,
        description: helpRequests.description,
        status: helpRequests.status,
        createdAt: helpRequests.createdAt,
        requestedById: helpRequests.requestedById,
        requestedByName: users.fullName,
        claimedById: helpRequests.claimedById,
        departmentId: helpRequests.departmentId,
        deptName: departments.name,
      })
      .from(helpRequests)
      .leftJoin(users, eq(helpRequests.requestedById, users.id))
      .leftJoin(departments, eq(helpRequests.departmentId, departments.id))
      .orderBy(desc(helpRequests.createdAt)),
    db.select().from(skills),
    db
      .select({
        helpRequestId: helpRequestSkills.helpRequestId,
        skillName: skills.name,
      })
      .from(helpRequestSkills)
      .leftJoin(skills, eq(helpRequestSkills.skillId, skills.id)),
  ]);

  // resolve claimed-by names
  const claimerIds = Array.from(new Set(requestRows.map((r) => r.claimedById).filter(Boolean))) as string[];
  const claimers = claimerIds.length
    ? await db.select({ id: users.id, fullName: users.fullName }).from(users)
    : [];
  const claimerMap = new Map(claimers.map((c) => [c.id, c.fullName]));

  const requestsWithSkills = requestRows.map((r) => ({
    ...r,
    claimedByName: r.claimedById ? claimerMap.get(r.claimedById) ?? null : null,
    skills: reqSkillRows.filter((s) => s.helpRequestId === r.id).map((s) => s.skillName ?? ""),
    canManage: user ? user.id === r.requestedById || isDeptAdminOf(user, r.departmentId) : false,
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
        <span className="node-dot" /> Help request board
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Ask, offer, resolve
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Post a request tagged with the skill you need. Members with a matching skill can claim it
        &mdash; it becomes a record the org can learn from.
      </p>

      {user && (
        <div className="mt-8">
          <HelpRequestComposer skillOptions={skillList.map((s) => s.name)} />
        </div>
      )}

      <div className="mt-10">
        <HelpRequestList
          requests={requestsWithSkills}
          currentUserId={user?.id ?? null}
          skillOptions={skillList.map((s) => s.name)}
        />
      </div>
    </div>
  );
}
