import Link from "next/link";
import { verifyEmailAction } from "@/lib/actions/auth";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmailAction(token ?? "");

  return (
    <div className="mx-auto max-w-sm px-5 py-20 text-center">
      {result.ok ? (
        <CheckCircle2 className="mx-auto text-sage" size={40} />
      ) : (
        <XCircle className="mx-auto text-coral" size={40} />
      )}
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        {result.ok ? "Email verified" : "Verification failed"}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">{result.message}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-none bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-soft"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
