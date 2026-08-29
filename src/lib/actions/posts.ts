"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { getCurrentUser, canPost, canPostPlatformWide, isDeptAdminOf } from "@/lib/auth";
import { newId } from "@/lib/id";
import { saveUpload } from "@/lib/upload";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You need to sign in to post an update." };
  if (!canPost(user)) return { error: "You don't have posting privileges yet. Ask your department admin to grant them." };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const scope = String(formData.get("scope") || "department");
  const pinned = formData.get("pinned") === "on";
  const attachment = formData.get("attachment");

  if (!title || !body) {
    return { error: "Please add a title and a message." };
  }

  let attachmentUrl: string | null = null;
  if (attachment instanceof File && attachment.size > 0) {
    const result = await saveUpload(attachment, "attachment");
    if ("error" in result) return { error: result.error };
    attachmentUrl = result.url;
  }

  let departmentId: string | null = user.departmentId;
  if (scope === "platform") {
    if (!canPostPlatformWide(user)) {
      return { error: "Only the Super Admin can post platform-wide updates." };
    }
    departmentId = null;
  }

  await db.insert(posts)
    .values({
      id: newId("post"),
      title,
      body,
      authorId: user.id,
      departmentId,
      attachmentUrl,
      pinned: pinned && (user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN"),
    });

  revalidatePath("/announcements");
  revalidatePath("/");
  return { error: undefined };
}

function canManagePost(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  post: { authorId: string; departmentId: string | null }
) {
  return post.authorId === user.id || isDeptAdminOf(user, post.departmentId);
}

export async function editPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const postId = String(formData.get("postId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const pinned = formData.get("pinned") === "on";
  const attachment = formData.get("attachment");

  if (!title || !body) return { error: "Please add a title and a message." };

  const rows = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  const post = rows[0];
  if (!post) return { error: "Update not found." };
  if (!canManagePost(user, post)) return { error: "You can't edit this update." };

  let attachmentUrl: string | undefined;
  if (attachment instanceof File && attachment.size > 0) {
    const result = await saveUpload(attachment, "attachment");
    if ("error" in result) return { error: result.error };
    attachmentUrl = result.url;
  }

  await db.update(posts)
    .set({
      title,
      body,
      pinned: pinned && (user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN"),
      updatedAt: new Date(),
      ...(attachmentUrl ? { attachmentUrl } : {}),
    })
    .where(eq(posts.id, postId));

  revalidatePath("/announcements");
  revalidatePath("/");
  return { error: undefined };
}

export async function deletePostAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const rows = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  const post = rows[0];
  if (!post) return { error: "Update not found." };
  if (!canManagePost(user, post)) return { error: "You can't delete this update." };

  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/announcements");
  revalidatePath("/");
  return { error: undefined };
}
