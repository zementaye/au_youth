import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "AU Youth Network — Interns, Volunteers & Fellows",
  description:
    "The directory, announcement feed, and skill-matching board for African Union youth interns, volunteers, and fellows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink">
          <div className="strip">
            <span style={{ background: "var(--forest)" }} />
            <span style={{ background: "var(--coral)" }} />
            <span style={{ background: "var(--gold)" }} />
            <span style={{ background: "var(--sage)" }} />
          </div>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 px-5 py-6 text-center text-xs text-ink-soft/70 sm:flex-row sm:justify-between sm:text-left">
            <p className="meta">AU Youth Engagement &amp; Skills Platform</p>
            <p className="meta">Built for interns, volunteers &amp; fellows across every department</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
