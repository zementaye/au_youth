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
    <header className="sticky top-0 z-40 border-b border-line bg-paper-raised/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[11px] font-bold text-paper">
            AU
          </span>
          <span className="font-display text-[15px] font-semibold text-ink">
            Youth Network
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
            >
              <l.icon size={15} strokeWidth={1.75} />
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
            >
              <ShieldCheck size={15} strokeWidth={1.75} />
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
                className="hidden items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink sm:flex"
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
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                >
                  <LogOut size={14} strokeWidth={1.75} />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
              >
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
            className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs text-ink-soft hover:bg-line-soft"
          >
            <l.icon size={13} strokeWidth={1.75} />
            {l.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs text-ink-soft hover:bg-line-soft"
          >
            <ShieldCheck size={13} strokeWidth={1.75} />
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
