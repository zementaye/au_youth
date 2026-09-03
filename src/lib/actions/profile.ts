"use server";

import { db } from "@/db";
import { users, skills, userSkills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { newId } from "@/lib/id";
import { saveUpload } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required." };

  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const linkedin = String(formData.get("linkedin") || "").trim();
  const twitter = String(formData.get("twitter") || "").trim();
  const github = String(formData.get("github") || "").trim();
  const portfolio = String(formData.get("portfolio") || "").trim();
  const skillNames = formData.getAll("skills").map((s) => String(s).trim()).filter(Boolean);
  const photo = formData.get("photo");

  if (!fullName) return { error: "Name is required." };

  let profilePhotoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const result = await saveUpload(photo, "image");
    if ("error" in result) return { error: result.error };
    profilePhotoUrl = result.url;
  }

  await db.update(users)
    .set({
      fullName,
      phone: phone || null,
      title: title || null,
      bio: bio || null,
      linkedin: linkedin || null,
      twitter: twitter || null,
      github: github || null,
      portfolio: portfolio || null,
      ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
    })
    .where(eq(users.id, user.id));

  // Replace skills wholesale (simple + predictable for a profile form)
  await db.delete(userSkills).where(eq(userSkills.userId, user.id));
  for (const name of skillNames) {
    let skillId: string;
    const found = await db.select().from(skills).where(eq(skills.name, name)).limit(1);
    if (found.length > 0) {
      skillId = found[0].id;
    } else {
      skillId = newId("skill");
      await db.insert(skills).values({ id: skillId, name, category: "Other" });
    }
    await db.insert(userSkills).values({ userId: user.id, skillId, proficiency: "INTERMEDIATE" });
  }

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  redirect("/dashboard?profileSaved=1");
}
