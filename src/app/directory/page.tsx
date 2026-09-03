import type { Metadata } from "next";
import { db } from "@/db";
import { users, departments, skills, userSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import DirectoryClient from "./DirectoryClient";

export const metadata: Metadata = {
  title: "Skill directory",
  description: "Search AU youth members by skill, department, or program type, and find who can help.",
};

export default async function DirectoryPage() {
  const viewer = await getCurrentUser();

  const [memberRows, deptList, skillList, allUserSkills] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        title: users.title,
        bio: users.bio,
        profilePhotoUrl: users.profilePhotoUrl,
        programType: users.programType,
        departmentId: users.departmentId,
        deptName: departments.name,
        linkedin: users.linkedin,
        twitter: users.twitter,
        github: users.github,
        portfolio: users.portfolio,
        phone: users.phone,
        email: users.email,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.isActive, true)),
    db.select().from(departments),
    db.select().from(skills),
    db
      .select({
        userId: userSkills.userId,
        skillId: userSkills.skillId,
        proficiency: userSkills.proficiency,
        skillName: skills.name,
      })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id)),
  ]);

  const members = memberRows.map((m) => ({
    ...m,
    skills: allUserSkills
      .filter((us) => us.userId === m.id)
      .map((us) => ({ name: us.skillName ?? "", proficiency: us.proficiency })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Skill directory
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Who can help with what
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
        Search by skill, filter by department or program type, and reach out directly &mdash;
        or post a help request if you&apos;re not sure who to ask.
      </p>

      <div className="mt-8">
        <DirectoryClient
          members={members}
          departments={deptList.map((d) => ({ id: d.id, name: d.name }))}
          skillNames={skillList.map((s) => s.name)}
          isLoggedIn={!!viewer}
        />
      </div>
    </div>
  );
}
