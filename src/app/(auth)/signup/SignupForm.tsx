"use client";

import { useActionState, useState } from "react";
import { signupAction, type FormState } from "@/lib/actions/auth";
import { X } from "lucide-react";

type Department = { id: string; name: string };

export default function SignupForm({
  departments,
  skillOptions,
}: {
  departments: Department[];
  skillOptions: string[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signupAction, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const matches = skillOptions.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !selectedSkills.includes(s) &&
      skillInput.length > 0
  );

  function addSkill(name: string) {
    const trimmed = name.trim();
    if (!trimmed || selectedSkills.includes(trimmed)) return;
    setSelectedSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function removeSkill(name: string) {
    setSelectedSkills((prev) => prev.filter((s) => s !== name));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <input id="fullName" name="fullName" required className="input" placeholder="Amara Diallo" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" required className="input" placeholder="you@auyouth.org" />
        </Field>
        <Field label="Password" htmlFor="password">
          <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input id="phone" name="phone" className="input" placeholder="+251 9xx xxx xxx" />
        </Field>
        <Field label="Department" htmlFor="departmentId">
          <select id="departmentId" name="departmentId" required className="input">
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program type" htmlFor="programType">
          <select id="programType" name="programType" required className="input">
            <option value="">Select type</option>
            <option value="INTERN">Intern</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="FELLOW">Fellow</option>
          </select>
        </Field>
      </div>

      <Field label="Title / position" htmlFor="title">
        <input id="title" name="title" className="input" placeholder="e.g. Backend Intern" />
      </Field>

      <Field label="Short bio" htmlFor="bio">
        <textarea id="bio" name="bio" rows={3} className="input resize-none" placeholder="A couple sentences about you" />
      </Field>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Skills</label>
        <div className="input flex flex-wrap items-center gap-1.5 !py-2">
          {selectedSkills.map((s) => (
            <span key={s} className="tag flex items-center gap-1 !bg-gold-soft/40">
              {s}
              <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder={selectedSkills.length === 0 ? "Type a skill and press Enter" : "Add another…"}
            className="min-w-[140px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
          />
        </div>
        {matches.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {matches.slice(0, 6).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => addSkill(m)}
                className="tag hover:bg-gold-soft/40"
              >
                + {m}
              </button>
            ))}
          </div>
        )}
        {selectedSkills.map((s) => (
          <input key={s} type="hidden" name="skills" value={s} />
        ))}
        <p className="mt-1.5 text-xs text-ink-soft/70">
          Not listed? Type it anyway &mdash; new skill tags are added automatically.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="LinkedIn (optional)" htmlFor="linkedin">
          <input id="linkedin" name="linkedin" className="input" placeholder="linkedin.com/in/…" />
        </Field>
        <Field label="GitHub / Portfolio (optional)" htmlFor="github">
          <input id="github" name="github" className="input" placeholder="github.com/…" />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Creating your profile…" : "Create my profile"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--paper-raised);
          border-radius: 0.5rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          color: var(--ink);
        }
        .input:focus {
          outline: 2px solid var(--coral);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
