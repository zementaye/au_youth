import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Nav from "@/components/Nav";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: {
    default: "AU Youth Network — Interns, Volunteers & Fellows",
    template: "%s | AU Youth Network",
  },
  description:
    "The directory, announcement feed, and skill-matching board for African Union youth interns, volunteers, and fellows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line-soft py-10">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
              <div>
                <p className="font-display text-sm font-semibold text-ink">AU Youth Network</p>
                <p className="meta mt-1.5 max-w-xs text-xs">
                  Built for interns, volunteers &amp; fellows across every AU department.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-6">
                <div>
                  <p className="meta mb-2 text-xs font-medium text-ink">Platform</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <Link href="/announcements" className="text-ink-soft hover:text-ink">
                        Updates
                      </Link>
                    </li>
                    <li>
                      <Link href="/directory" className="text-ink-soft hover:text-ink">
                        Directory
                      </Link>
                    </li>
                    <li>
                      <Link href="/help-requests" className="text-ink-soft hover:text-ink">
                        Help board
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="meta mb-2 text-xs font-medium text-ink">Account</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <Link href="/login" className="text-ink-soft hover:text-ink">
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-ink-soft hover:text-ink">
                        Join the network
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="meta mb-2 text-xs font-medium text-ink">Contact</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <a href="mailto:hello@auyouth.org" className="text-ink-soft hover:text-ink">
                        hello@auyouth.org
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-line-soft pt-6">
              <p className="meta text-xs">
                &copy; {new Date().getFullYear()} African Union Youth Engagement &amp; Skills Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
