import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fixed-window rate limiter backed by SQLite. Good enough for a single-instance
 * deployment; for multi-instance production use, swap this for a shared store
 * (e.g. Redis / Upstash) behind the same checkRateLimit(key, ...) signature.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<{ ok: boolean; retryAfterMs?: number }> {
  const now = Date.now();
  const rows = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  const existing = rows[0];

  if (!existing) {
    await db.insert(rateLimits).values({ key, count: 1, windowStart: String(now) });
    return { ok: true };
  }

  const windowStart = Number(existing.windowStart);
  const elapsed = now - windowStart;

  if (elapsed > windowMs) {
    // window expired, reset
    await db.update(rateLimits).set({ count: 1, windowStart: String(now) }).where(eq(rateLimits.key, key));
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterMs: windowMs - elapsed };
  }

  await db.update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.key, key));
  return { ok: true };
}
