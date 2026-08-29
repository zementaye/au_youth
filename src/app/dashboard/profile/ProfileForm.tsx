"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type FormState } from "@/lib/actions/profile";
import { X } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";

export default function ProfileForm({
  user,
  initialSkills,
  skillOptions,
}: {
  user: CurrentUser;
  initialSkills: string[];
  skillOptions: string[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfileAction, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.profilePhotoUrl ?? null);

  const matches = skillOptions.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s) && skillInput.length > 0
  );

  function addSkill(name: string) {
    const trimmed = name.trim();
    if (!trimmed || selectedSkills.includes(trimmed)) return;
    setSelectedSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Profile photo</label>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-paper-raised">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft/50">No photo</div>
            )}
          </div>
          <input
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhotoPreview(URL.createObjectURL(file));
            }}
            className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border file:border-line file:bg-paper-raised file:px-3 file:py-1.5 file:text-xs file:text-ink-soft hover:file:border-ink"
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-soft/70">PNG, JPEG, WEBP, or GIF, up to 5MB.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <input id="fullName" name="fullName" defaultValue={user.fullName} required className="input" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input id="phone" name="phone" defaultValue={user.phone ?? ""} className="input" />
        </Field>
      </div>

      <Field label="Title / position" htmlFor="title">
        <input id="title" name="title" defaultValue={user.title ?? ""} className="input" />
      </Field>

      <Field label="Bio" htmlFor="bio">
        <textarea id="bio" name="bio" rows={3} defaultValue={user.bio ?? ""} className="input resize-none" />
      </Field>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Skills</label>
        <div className="input flex flex-wrap items-center gap-1.5 !py-2">
          {selectedSkills.map((s) => (
            <span key={s} className="tag flex items-center gap-1 !bg-gold-soft/40">
              {s}
              <button type="button" onClick={() => setSelectedSkills((p) => p.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
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
            placeholder="Add a skill…"
            className="min-w-[140px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
          />
        </div>
        {matches.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {matches.slice(0, 6).map((m) => (
              <button key={m} type="button" onClick={() => addSkill(m)} className="tag hover:bg-gold-soft/40">
                + {m}
              </button>
            ))}
          </div>
        )}
        {selectedSkills.map((s) => (
          <input key={s} type="hidden" name="skills" value={s} />
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="LinkedIn" htmlFor="linkedin">
          <input id="linkedin" name="linkedin" defaultValue={user.linkedin ?? ""} className="input" />
        </Field>
        <Field label="GitHub" htmlFor="github">
          <input id="github" name="github" defaultValue={user.github ?? ""} className="input" />
        </Field>
        <Field label="Twitter / X" htmlFor="twitter">
          <input id="twitter" name="twitter" defaultValue={user.twitter ?? ""} className="input" />
        </Field>
        <Field label="Portfolio" htmlFor="portfolio">
          <input id="portfolio" name="portfolio" defaultValue={user.portfolio ?? ""} className="input" />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
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

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
