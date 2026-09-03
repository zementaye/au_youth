import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your AU Youth Network account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Password reset
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Set a new password</h1>
      <div className="mt-8">
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
