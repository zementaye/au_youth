import { db } from "@/db";
import { devEmails } from "@/db/schema";
import { newId } from "@/lib/id";

/**
 * No email provider (Resend/SendGrid) is wired up in this environment.
 * This writes the email to a "dev outbox" table (viewable at /admin/outbox
 * by the Super Admin) and logs it to the console, so verification and
 * password-reset flows are fully testable end-to-end. Swap the body of this
 * function for a real provider call in production — the call sites don't
 * need to change.
 */
export async function sendEmail({
  to,
  subject,
  body,
  link,
}: {
  to: string;
  subject: string;
  body: string;
  link?: string;
}) {
  await db.insert(devEmails)
    .values({ id: newId("email"), toEmail: to, subject, body, link: link ?? null });

  // eslint-disable-next-line no-console
  console.log(`[dev-email] to=${to} subject="${subject}"${link ? ` link=${link}` : ""}`);
}
