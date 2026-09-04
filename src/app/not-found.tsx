import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center bg-gold-soft text-gold">
        <Compass size={22} strokeWidth={1.75} />
      </div>
      <p className="meta mb-2 text-xs font-medium">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The page you&apos;re looking for may have been moved, renamed, or never
        existed. Try one of these instead:
      </p>
      <div className="mt-7 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
        >
          Go home <ArrowRight size={15} />
        </Link>
        <Link
          href="/directory"
          className="flex items-center justify-center gap-2 border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30 hover:bg-line-soft"
        >
          Browse the directory
        </Link>
      </div>
    </div>
  );
}
