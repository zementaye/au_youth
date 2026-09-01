"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-none border border-coral/40 bg-coral/5 px-4 py-3 text-sm text-coral">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" placeholder="you@auyouth.org" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-ink-soft underline hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink underline">
          Create a profile
        </Link>
      </p>
    </form>
  );
}
