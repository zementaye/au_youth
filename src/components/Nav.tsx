import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { getMyNotifications } from "@/lib/actions/notifications";
import NotificationBell from "@/components/NotificationBell";
import MobileMenu from "@/components/MobileMenu";
import { LogOut, UserCircle } from "lucide-react";

export default async function Nav() {
  const user = await getCurrentUser();
  const { notifications, unreadCount } = user
    ? await getMyNotifications()
    : { notifications: [], unreadCount: 0 };

  const links = [
    { href: "/announcements", label: "Updates", icon: "grid" as const },
    { href: "/directory", label: "Directory", icon: "users" as const },
    { href: "/help-requests", label: "Help Board", icon: "messages" as const },
  ];

  const isAdmin = user && (user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper-raised/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center bg-ink text-[11px] font-bold text-paper">
            AU
          </span>
          <span className="font-display text-[15px] font-semibold text-ink">
            Youth Network
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-center gap-1.5 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
              <span className="block h-[2px] w-0 bg-marigold transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="group flex items-center gap-1.5 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Admin
              <span className="block h-[2px] w-0 bg-marigold transition-all duration-200 group-hover:w-full" />
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
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
                    className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
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
                  className="px-1 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-brand"
                >
                  Join the network
                </Link>
              </>
            )}
          </div>

          <MobileMenu
            links={links}
            isAdmin={!!isAdmin}
            isLoggedIn={!!user}
            fullName={user?.fullName}
            profilePhotoUrl={user?.profilePhotoUrl}
            logoutAction={logoutAction}
          />
        </div>
      </div>
    </header>
  );
}
