"use server";

import { db } from "@/db";
import { users, departments, skills, userSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { newId, newToken } from "@/lib/id";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mailer";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type FormState = { error?: string; info?: string } | null;

const VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const RESET_TTL_MS = 1000 * 60 * 30; // 30 min

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  const ipLimit = await checkRateLimit(`signup:ip:${ip}`, { limit: 8, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.ok) {
    return { error: "Too many signup attempts from this connection. Please try again later." };
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();
  const departmentId = String(formData.get("departmentId") || "");
  const programType = String(formData.get("programType") || "");
  const title = String(formData.get("title") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const linkedin = String(formData.get("linkedin") || "").trim();
  const twitter = String(formData.get("twitter") || "").trim();
  const github = String(formData.get("github") || "").trim();
  const portfolio = String(formData.get("portfolio") || "").trim();
  const skillNames = formData.getAll("skills").map((s) => String(s).trim()).filter(Boolean);

  if (!fullName || !email || !password || !departmentId || !programType) {
    return { error: "Please fill in your name, email, password, department, and program type." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const dept = await db.select().from(departments).where(eq(departments.id, departmentId)).limit(1);
  if (dept.length === 0) {
    return { error: "Please choose a valid department." };
  }

  const passwordHash = await hashPassword(password);
  const userId = newId("user");
  const verifyToken = newToken();
  const verifyTokenExpiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  await db.insert(users)
    .values({
      id: userId,
      fullName,
      email,
      passwordHash,
      phone: phone || null,
      departmentId,
      programType: programType as "INTERN" | "VOLUNTEER" | "FELLOW",
      title: title || null,
      bio: bio || null,
      linkedin: linkedin || null,
      twitter: twitter || null,
      github: github || null,
      portfolio: portfolio || null,
      systemRole: "MEMBER",
      isPoster: false,
      isActive: true,
      // Simplified onboarding: no manual approval step, but flagged unverified
      // until the person clicks the verification link.
      emailVerified: false,
      verifyToken,
      verifyTokenExpiresAt,
    });

  // Attach / create skills
  for (const name of skillNames) {
    let skillId: string;
    const foundSkill = await db.select().from(skills).where(eq(skills.name, name)).limit(1);
    if (foundSkill.length > 0) {
      skillId = foundSkill[0].id;
    } else {
      skillId = newId("skill");
      await db.insert(skills).values({ id: skillId, name, category: "Other" });
    }
    await db.insert(userSkills).values({ userId, skillId, proficiency: "INTERMEDIATE" });
  }

  await sendEmail({
    to: email,
    subject: "Verify your AU Youth Network email",
    body: `Hi ${fullName}, confirm your email to finish setting up your account.`,
    link: `/verify?token=${verifyToken}`,
  });

  await setSessionCookie(userId);
  redirect("/dashboard");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const ip = await clientIp();
  const ipLimit = await checkRateLimit(`login:ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  const emailLimit = await checkRateLimit(`login:email:${email}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!ipLimit.ok || !emailLimit.ok) {
    return { error: "Too many login attempts. Please wait a few minutes and try again." };
  }

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user) {
    return { error: "No account found with that email." };
  }
  if (!user.isActive) {
    return { error: "This account has been deactivated. Contact your department admin." };
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  await setSessionCookie(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function verifyEmailAction(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token) return { ok: false, message: "Missing verification token." };

  const rows = await db.select().from(users).where(eq(users.verifyToken, token)).limit(1);
  const user = rows[0];
  if (!user) return { ok: false, message: "This verification link is invalid or has already been used." };
  if (user.verifyTokenExpiresAt && user.verifyTokenExpiresAt < new Date()) {
    return { ok: false, message: "This verification link has expired. Request a new one from your dashboard." };
  }

  await db.update(users)
    .set({ emailVerified: true, verifyToken: null, verifyTokenExpiresAt: null })
    .where(eq(users.id, user.id));

  return { ok: true, message: "Your email is verified." };
}

export async function resendVerificationAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const verifyToken = newToken();
  const verifyTokenExpiresAt = new Date(Date.now() + VERIFY_TTL_MS);
  await db.update(users).set({ verifyToken, verifyTokenExpiresAt }).where(eq(users.id, user.id));

  await sendEmail({
    to: user.email,
    subject: "Verify your AU Youth Network email",
    body: `Hi ${user.fullName}, confirm your email to finish setting up your account.`,
    link: `/verify?token=${verifyToken}`,
  });

  return { ok: true };
}

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Enter your email." };

  const ip = await clientIp();
  const limit = await checkRateLimit(`forgot:ip:${ip}`, { limit: 6, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return { error: "Too many requests. Please try again later." };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  // Always return the same message whether or not the account exists,
  // so this can't be used to enumerate registered emails.
  if (user) {
    const resetToken = newToken();
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TTL_MS);
    await db.update(users).set({ resetToken, resetTokenExpiresAt }).where(eq(users.id, user.id));
    await sendEmail({
      to: email,
      subject: "Reset your AU Youth Network password",
      body: `Hi ${user.fullName}, use this link to set a new password. It expires in 30 minutes.`,
      link: `/reset-password?token=${resetToken}`,
    });
  }

  return { info: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (!token) return { error: "Missing reset token." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const rows = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  const user = rows[0];
  if (!user) return { error: "This reset link is invalid or has already been used." };
  if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(password);
  await db.update(users)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
    .where(eq(users.id, user.id));

  await setSessionCookie(user.id);
  redirect("/dashboard");
}
