import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AU Youth Network account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Welcome back
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Sign in</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
