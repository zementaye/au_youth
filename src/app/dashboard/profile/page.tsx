import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { userSkills, skills } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [mySkills, allSkills] = await Promise.all([
    db
      .select({ name: skills.name })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, user.id)),
    db.select().from(skills),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
        <span className="node-dot" /> Your profile
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Edit profile
      </h1>
      <div className="mt-10">
        <ProfileForm
          user={user}
          initialSkills={mySkills.map((s) => s.name ?? "").filter(Boolean)}
          skillOptions={allSkills.map((s) => s.name)}
        />
      </div>
    </div>
  );
}
