"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "@/lib/actions/auth";
import { MailWarning } from "lucide-react";

export default function VerifyBanner() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-none border border-gold/40 bg-gold-soft/20 px-4 py-3 text-sm text-ink">
      <MailWarning size={16} className="shrink-0 text-gold" />
      <span className="flex-1">
        {sent ? "Verification email sent — check the dev outbox." : "Your email isn't verified yet."}
      </span>
      {!sent && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await resendVerificationAction();
              setSent(true);
            })
          }
          className="rounded-none border border-ink/20 px-3 py-1 text-xs font-medium text-ink hover:border-ink disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Resend verification"}
        </button>
      )}
    </div>
  );
}
