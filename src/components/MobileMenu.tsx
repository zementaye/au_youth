"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, LogOut, UserCircle, LayoutGrid, Users, MessagesSquare } from "lucide-react";

const ICON_MAP = { grid: LayoutGrid, users: Users, messages: MessagesSquare } as const;

type NavLink = { href: string; label: string; icon: keyof typeof ICON_MAP };

export default function MobileMenu({
  links,
  isAdmin,
  isLoggedIn,
  fullName,
  profilePhotoUrl,
  logoutAction,
}: {
  links: NavLink[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  fullName?: string;
  profilePhotoUrl?: string | null;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the menu whenever the route changes (e.g. after tapping a link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <div
      className={`material fixed inset-0 z-50 flex flex-col bg-paper/97 backdrop-blur-xl transition-opacity duration-200 ${
        open ? "animate-materialize opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ transformOrigin: "top right" }}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
        <Link href="/" className="tap flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-6 w-6 items-center justify-center bg-ink text-[11px] font-bold text-paper">
            AU
          </span>
          <span className="font-display text-[15px] font-semibold text-ink">Youth Network</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="tap flex h-10 w-10 items-center justify-center text-ink-soft hover:bg-line-soft hover:text-ink"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-5">
        {links.map((l) => {
          const Icon = ICON_MAP[l.icon];
          return (
            <Link
              key={l.href}
              href={l.href}
              className="tap flex items-center gap-3 px-4 py-3.5 text-base text-ink hover:bg-line-soft"
            >
              <Icon size={19} strokeWidth={1.75} />
              {l.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="tap flex items-center gap-3 px-4 py-3.5 text-base text-ink hover:bg-line-soft"
          >
            <ShieldCheck size={19} strokeWidth={1.75} />
            Admin
          </Link>
        )}

        <div className="my-2 border-t border-line" />

        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="tap flex items-center gap-3 px-4 py-3.5 text-base text-ink hover:bg-line-soft"
            >
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePhotoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <UserCircle size={19} strokeWidth={1.75} />
              )}
              {fullName ? `${fullName.split(" ")[0]}'s dashboard` : "Dashboard"}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="tap flex w-full items-center gap-3 px-4 py-3.5 text-left text-base text-ink-soft hover:bg-line-soft hover:text-ink"
              >
                <LogOut size={19} strokeWidth={1.75} />
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="tap flex items-center gap-3 px-4 py-3.5 text-base text-ink hover:bg-line-soft"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="tap mt-2 flex items-center justify-center gap-2 bg-ink px-4 py-3.5 text-base font-medium text-paper"
            >
              Join the network
            </Link>
          </>
        )}
      </nav>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="tap flex h-10 w-10 items-center justify-center text-ink-soft hover:bg-line-soft hover:text-ink"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Rendered via portal to document.body: the header uses backdrop-blur,
          which (like any CSS filter/backdrop-filter) creates a new
          containing block for descendants — that silently breaks
          `position: fixed` for anything nested inside it, anchoring it to
          the header's own box instead of the viewport. Portaling out of
          the header's DOM subtree sidesteps that entirely. Always mounted
          (once) rather than conditionally rendered, so both the entrance
          and the exit can transition instead of hard-cutting on close. */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
