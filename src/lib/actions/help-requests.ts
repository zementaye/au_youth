"use server";

import { db } from "@/db";
import { helpRequests, helpRequestSkills, skills, notifications, userSkills } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser, isDeptAdminOf } from "@/lib/auth";
import { newId } from "@/lib/id";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

async function notifySkillMatches(helpRequestId: string, skillIds: string[], requesterId: string, title: string) {
  if (skillIds.length === 0) return;

  const matches = await db
    .select({ userId: userSkills.userId })
    .from(userSkills)
    .where(inArray(userSkills.skillId, skillIds));

  const uniqueUserIds = Array.from(new Set(matches.map((m) => m.userId))).filter((id) => id !== requesterId);

  for (const userId of uniqueUserIds) {
    await db.insert(notifications)
      .values({
        id: newId("notif"),
        userId,
        type: "SKILL_MATCH",
        message: `A new help request matches your skills: "${title}"`,
        link: "/help-requests",
      });
  }
}

export async function createHelpRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to post a help request." };

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const skillNames = formData.getAll("skills").map((s) => String(s).trim()).filter(Boolean);

  if (!title || !description || skillNames.length === 0) {
    return { error: "Add a title, description, and at least one required skill." };
  }

  const helpRequestId = newId("hr");
  await db.insert(helpRequests)
    .values({
      id: helpRequestId,
      title,
      description,
      requestedById: user.id,
      departmentId: user.departmentId,
      status: "OPEN",
    });

  const skillIds: string[] = [];
  for (const name of skillNames) {
    let skillId: string;
    const found = await db.select().from(skills).where(eq(skills.name, name)).limit(1);
    if (found.length > 0) {
      skillId = found[0].id;
    } else {
      skillId = newId("skill");
      await db.insert(skills).values({ id: skillId, name, category: "Other" });
    }
    await db.insert(helpRequestSkills).values({ helpRequestId, skillId });
    skillIds.push(skillId);
  }

  await notifySkillMatches(helpRequestId, skillIds, user.id, title);

  revalidatePath("/help-requests");
  return { error: undefined };
}

function canManageHelpRequest(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  hr: { requestedById: string; departmentId: string | null }
) {
  return hr.requestedById === user.id || isDeptAdminOf(user, hr.departmentId);
}

export async function editHelpRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const helpRequestId = String(formData.get("helpRequestId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const skillNames = formData.getAll("skills").map((s) => String(s).trim()).filter(Boolean);

  if (!title || !description || skillNames.length === 0) {
    return { error: "Add a title, description, and at least one required skill." };
  }

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (!canManageHelpRequest(user, hr)) return { error: "You can't edit this request." };

  await db.update(helpRequests)
    .set({ title, description, updatedAt: new Date() })
    .where(eq(helpRequests.id, helpRequestId));

  await db.delete(helpRequestSkills).where(eq(helpRequestSkills.helpRequestId, helpRequestId));
  for (const name of skillNames) {
    let skillId: string;
    const found = await db.select().from(skills).where(eq(skills.name, name)).limit(1);
    if (found.length > 0) {
      skillId = found[0].id;
    } else {
      skillId = newId("skill");
      await db.insert(skills).values({ id: skillId, name, category: "Other" });
    }
    await db.insert(helpRequestSkills).values({ helpRequestId, skillId });
  }

  revalidatePath("/help-requests");
  return { error: undefined };
}

export async function deleteHelpRequestAction(helpRequestId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (!canManageHelpRequest(user, hr)) return { error: "You can't delete this request." };

  await db.delete(helpRequests).where(eq(helpRequests.id, helpRequestId));

  revalidatePath("/help-requests");
  return { error: undefined };
}

export async function claimHelpRequestAction(helpRequestId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to claim this request." };

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (hr.status !== "OPEN") return { error: "This request is no longer open." };

  await db.update(helpRequests)
    .set({ status: "CLAIMED", claimedById: user.id })
    .where(eq(helpRequests.id, helpRequestId));

  await db.insert(notifications)
    .values({
      id: newId("notif"),
      userId: hr.requestedById,
      type: "HELP_CLAIMED",
      message: `${user.fullName} offered to help with "${hr.title}".`,
      link: "/help-requests",
    });

  revalidatePath("/help-requests");
  return { error: undefined };
}

export async function unclaimHelpRequestAction(helpRequestId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (hr.status !== "CLAIMED") return { error: "This request isn't currently claimed." };
  if (hr.claimedById !== user.id && !canManageHelpRequest(user, hr)) {
    return { error: "Only the person who claimed this, the requester, or an admin can reopen it." };
  }

  await db.update(helpRequests)
    .set({ status: "OPEN", claimedById: null })
    .where(eq(helpRequests.id, helpRequestId));

  await db.insert(notifications)
    .values({
      id: newId("notif"),
      userId: hr.requestedById,
      type: "HELP_REOPENED",
      message: `"${hr.title}" is open again — the previous helper stepped back.`,
      link: "/help-requests",
    });

  revalidatePath("/help-requests");
  return { error: undefined };
}

export async function resolveHelpRequestAction(helpRequestId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (!canManageHelpRequest(user, hr)) {
    return { error: "Only the requester or a department admin can mark this resolved." };
  }

  await db.update(helpRequests)
    .set({ status: "RESOLVED", resolvedAt: new Date() })
    .where(eq(helpRequests.id, helpRequestId));

  if (hr.claimedById) {
    await db.insert(notifications)
      .values({
        id: newId("notif"),
        userId: hr.claimedById,
        type: "HELP_RESOLVED",
        message: `"${hr.title}" was marked resolved. Thanks for helping out!`,
        link: "/help-requests",
      });
  }

  revalidatePath("/help-requests");
  return { error: undefined };
}

export async function reopenHelpRequestAction(helpRequestId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const rows = await db.select().from(helpRequests).where(eq(helpRequests.id, helpRequestId)).limit(1);
  const hr = rows[0];
  if (!hr) return { error: "Help request not found." };
  if (hr.status !== "RESOLVED") return { error: "This request isn't resolved." };
  if (!canManageHelpRequest(user, hr)) {
    return { error: "Only the requester or a department admin can reopen this." };
  }

  await db.update(helpRequests)
    .set({ status: hr.claimedById ? "CLAIMED" : "OPEN", resolvedAt: null })
    .where(eq(helpRequests.id, helpRequestId));

  revalidatePath("/help-requests");
  return { error: undefined };
}
