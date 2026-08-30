"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type FormState } from "@/lib/actions/auth";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(forgotPasswordAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
          {state.error}
        </div>
      )}
      {state?.info && (
        <div className="rounded-none border border-sage/40 bg-sage/5 px-4 py-3 text-sm text-sage">
          {state.info}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" placeholder="you@auyouth.org" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
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
