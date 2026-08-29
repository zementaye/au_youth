import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("checkRateLimit", () => {
  const key = `test:${Math.random()}`;

  beforeEach(async () => {
    await db.delete(rateLimits).where(eq(rateLimits.key, key));
  });

  it("allows requests up to the limit", async () => {
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(key, { limit: 3, windowMs: 60_000 });
      expect(result.ok).toBe(true);
    }
  });

  it("blocks once the limit is exceeded within the window", async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    }
    const result = await checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets once the window has elapsed", async () => {
    // simulate a request 2 minutes ago, outside a 1-minute window
    await db.insert(rateLimits).values({ key, count: 99, windowStart: String(Date.now() - 120_000) });
    const result = await checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.ok).toBe(true);
  });
});
