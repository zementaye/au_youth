"use server";

import { db } from "@/db";
import { departments, users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, isDeptAdminOf } from "@/lib/auth";
import { newId } from "@/lib/id";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

async function logAction(actorId: string, action: string, targetType: string, targetId: string, details?: string) {
  await db.insert(auditLogs)
    .values({ id: newId("audit"), actorId, action, targetType, targetId, details: details ?? null });
}

// ---------- Departments (Super Admin only) ----------
export async function createDepartmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.systemRole !== "SUPER_ADMIN") return { error: "Only the Super Admin can manage departments." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name) return { error: "Department name is required." };

  const existing = await db.select().from(departments).where(eq(departments.name, name)).limit(1);
  if (existing.length > 0) return { error: "A department with this name already exists." };

  const id = newId("dept");
  await db.insert(departments).values({ id, name, description: description || null });
  await logAction(user.id, "CREATE_DEPARTMENT", "department", id, name);

  revalidatePath("/admin/departments");
  return { error: undefined };
}

export async function assignDeptAdminAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.systemRole !== "SUPER_ADMIN") return { error: "Only the Super Admin can assign department admins." };

  const departmentId = String(formData.get("departmentId") || "");
  const userId = String(formData.get("userId") || "");
  if (!departmentId || !userId) return { error: "Missing department or user." };

  await db.update(departments).set({ deptAdminId: userId }).where(eq(departments.id, departmentId));
  await db.update(users).set({ systemRole: "DEPT_ADMIN", isPoster: true, departmentId }).where(eq(users.id, userId));
  await logAction(user.id, "ASSIGN_DEPT_ADMIN", "user", userId, departmentId);

  revalidatePath("/admin/departments");
  revalidatePath("/admin/users");
}

export async function handoffDeptAdminAction(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) return { error: "Sign in required." };
  if (actor.systemRole !== "DEPT_ADMIN" || !actor.departmentId) {
    return { error: "Only a department admin can hand off their role." };
  }

  const userId = String(formData.get("userId") || "");
  if (!userId) return { error: "Choose who to hand the role to." };

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const target = rows[0];
  if (!target || target.departmentId !== actor.departmentId || !target.isActive) {
    return { error: "That person isn't an active member of your department." };
  }

  await db.update(departments).set({ deptAdminId: target.id }).where(eq(departments.id, actor.departmentId));
  await db.update(users).set({ systemRole: "DEPT_ADMIN", isPoster: true }).where(eq(users.id, target.id));
  await db.update(users).set({ systemRole: "MEMBER" }).where(eq(users.id, actor.id));
  await logAction(actor.id, "HANDOFF_DEPT_ADMIN", "user", target.id, actor.departmentId);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function togglePosterAction(userId: string) {
  const actor = await getCurrentUser();
  if (!actor) return { error: "Sign in required." };

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const target = rows[0];
  if (!target) return { error: "User not found." };
  if (!isDeptAdminOf(actor, target.departmentId)) return { error: "You can only manage members in your department." };

  await db.update(users).set({ isPoster: !target.isPoster }).where(eq(users.id, userId));
  await logAction(actor.id, target.isPoster ? "REVOKE_POSTER" : "GRANT_POSTER", "user", userId);

  revalidatePath("/admin/users");
}

export async function toggleActiveAction(userId: string) {
  const actor = await getCurrentUser();
  if (!actor) return { error: "Sign in required." };

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const target = rows[0];
  if (!target) return { error: "User not found." };
  if (!isDeptAdminOf(actor, target.departmentId)) return { error: "You can only manage members in your department." };
  if (target.systemRole === "SUPER_ADMIN") return { error: "The Super Admin account can't be deactivated." };

  await db.update(users).set({ isActive: !target.isActive }).where(eq(users.id, userId));
  await logAction(actor.id, target.isActive ? "DEACTIVATE_USER" : "REACTIVATE_USER", "user", userId);

  revalidatePath("/admin/users");
}
