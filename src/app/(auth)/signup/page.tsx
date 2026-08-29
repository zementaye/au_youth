import { db } from "@/db";
import { departments, skills } from "@/db/schema";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const [deptList, skillList] = await Promise.all([
    db.select().from(departments),
    db.select().from(skills),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <p className="meta mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
        <span className="node-dot" /> Create your profile
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Join the AU Youth Network
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
        Your account is active immediately &mdash; no approval wait. Add your skills so
        colleagues across departments can find you when they need help.
      </p>
      <div className="mt-10">
        <SignupForm departments={deptList} skillOptions={skillList.map((s) => s.name)} />
      </div>
    </div>
  );
}
