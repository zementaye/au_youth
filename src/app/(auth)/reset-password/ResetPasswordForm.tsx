"use client";

import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "@/lib/actions/auth";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(resetPasswordAction, null);

  if (!token) {
    return (
      <p className="rounded-md border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
        This link is missing its reset token. Request a new one from the forgot-password page.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <div className="rounded-md border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          New password
        </label>
        <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set new password"}
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
