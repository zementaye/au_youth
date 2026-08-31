import { db } from "@/db";
import { posts, users, departments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser, canPost, isDeptAdminOf } from "@/lib/auth";
import PostComposer from "./PostComposer";
import PostFeed from "./PostFeed";

export default async function AnnouncementsPage() {
  const [user, feed, deptList] = await Promise.all([
    getCurrentUser(),
    db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        pinned: posts.pinned,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        authorName: users.fullName,
        authorTitle: users.title,
        attachmentUrl: posts.attachmentUrl,
        departmentId: posts.departmentId,
        deptName: departments.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(departments, eq(posts.departmentId, departments.id))
      .orderBy(desc(posts.pinned), desc(posts.createdAt)),
    db.select().from(departments),
  ]);

  const feedWithPerms = feed.map((p) => ({
    ...p,
    canManage: user ? user.id === p.authorId || isDeptAdminOf(user, p.departmentId) : false,
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="meta mb-3 flex items-center gap-2 text-xs font-medium">
        <span className="node-dot" /> Announcement feed
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Updates across the network
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Platform-wide news plus what&apos;s happening in each department. Pinned items stay on top.
      </p>

      {user && canPost(user) && (
        <div className="mt-8">
          <PostComposer
            canPostPlatformWide={user.systemRole === "SUPER_ADMIN"}
            canPin={user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN"}
            deptName={deptList.find((d) => d.id === user.departmentId)?.name}
          />
        </div>
      )}

      <div className="mt-10">
        <PostFeed posts={feedWithPerms} canPin={!!user && (user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN")} />
      </div>
    </div>
  );
}
