import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Password reset
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Forgot password</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Enter your email and we&apos;ll send a link to set a new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
