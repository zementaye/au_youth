import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { devEmails } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Mail } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dev email outbox",
  description: "View verification and password-reset emails sent in this environment.",
  robots: { index: false, follow: false },
};

export default async function DevOutboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.systemRole !== "SUPER_ADMIN") redirect("/admin");

  const emails = await db.select().from(devEmails).orderBy(desc(devEmails.createdAt)).limit(50);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Admin panel
      </p>
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        <Mail size={26} /> Dev email outbox
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        No real email provider is connected in this environment, so verification and
        password-reset emails land here instead of an inbox. Wire up Resend or
        SendGrid in <code className="rounded bg-paper-raised px-1.5 py-0.5 text-xs">src/lib/mailer.ts</code> for production.
      </p>

      <div className="mt-8 space-y-3">
        {emails.map((e) => (
          <div key={e.id} className="card-raised rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
              <span>
                To: <a href={`mailto:${e.toEmail}`} className="underline hover:text-ink">{e.toEmail}</a>
              </span>
              <span className="meta">{formatDateTime(e.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-ink">{e.subject}</p>
            <p className="mt-1 text-sm text-ink-soft">{e.body}</p>
            {e.link && (
              <Link href={e.link} className="mt-2 inline-block text-sm text-coral underline">
                Open link →
              </Link>
            )}
          </div>
        ))}
        {emails.length === 0 && <p className="text-sm text-ink-soft">No emails sent yet.</p>}
      </div>
    </div>
  );
}
