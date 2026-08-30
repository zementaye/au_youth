import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { getMyNotifications } from "@/lib/actions/notifications";
import NotificationBell from "@/components/NotificationBell";
import { LayoutGrid, Users, MessagesSquare, ShieldCheck, LogOut, UserCircle } from "lucide-react";

export default async function Nav() {
  const user = await getCurrentUser();
  const { notifications, unreadCount } = user
    ? await getMyNotifications()
    : { notifications: [], unreadCount: 0 };

  const links = [
    { href: "/announcements", label: "Updates", icon: LayoutGrid },
    { href: "/directory", label: "Directory", icon: Users },
    { href: "/help-requests", label: "Help Board", icon: MessagesSquare },
  ];

  const isAdmin = user && (user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN");

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-paper/97 backdrop-blur">
      <div className="strip">
        <span style={{ background: "var(--sage)" }} />
        <span style={{ background: "var(--gold)" }} />
        <span style={{ background: "var(--coral)" }} />
        <span style={{ background: "var(--forest)" }} />
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center border border-ink bg-ink">
            <span className="h-2 w-2 bg-paper" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            AU Youth Network
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="eyebrow flex items-center gap-1.5 border-b-2 border-transparent py-1 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <l.icon size={14} strokeWidth={2} />
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="eyebrow flex items-center gap-1.5 border-b-2 border-transparent py-1 text-coral transition-colors hover:border-coral"
            >
              <ShieldCheck size={14} strokeWidth={2} />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 text-sm text-ink-soft hover:text-ink sm:flex"
              >
                {user.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePhotoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <UserCircle size={16} strokeWidth={1.75} />
                )}
                {user.fullName.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-outline !py-1.5 !text-xs">
                  <LogOut size={13} strokeWidth={2} />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="eyebrow text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary !py-1.5 !text-xs">
                Join the network
              </Link>
            </>
          )}
        </div>
      </div>
      {/* mobile nav row */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line-soft px-5 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex shrink-0 items-center gap-1.5 border border-transparent px-3 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
          >
            <l.icon size={13} strokeWidth={1.75} />
            {l.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-1.5 border border-transparent px-3 py-1 text-xs text-coral hover:border-coral"
          >
            <ShieldCheck size={13} strokeWidth={1.75} />
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
