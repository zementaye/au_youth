"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";

type Notif = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date | string | null;
};

export default function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notif[];
  initialUnreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [, startTransition] = useTransition();

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleItemClick(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(() => {
      markNotificationReadAction(id);
    });
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
      >
        <Bell size={17} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-medium text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="card-raised absolute right-0 z-50 mt-2 w-80 rounded-lg p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">Notifications</p>
              {items.length > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-ink-soft underline hover:text-ink">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => handleItemClick(n.id)}
                  className={`block rounded-md px-2 py-2 text-sm transition-colors hover:bg-paper ${
                    n.isRead ? "text-ink-soft" : "text-ink"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />}
                    <span className={n.isRead ? "" : "font-medium"}>{n.message}</span>
                  </span>
                </Link>
              ))}
              {items.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-ink-soft">You&apos;re all caught up.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
