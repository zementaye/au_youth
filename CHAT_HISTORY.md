# Chat History

A running summary of what was discussed and built across Claude sessions on
this project. Not generated from git — appended by hand (by Claude) after
sessions where real work happened. See `COMMIT_HISTORY.md` for the actual
commit log.

## 2026-08-29

Built the initial platform from the original build prompt: announcement
feed, skill directory, help-request board, member dashboard, and a
tiered admin panel (Super Admin / Dept Admin / poster privileges), on
Next.js + Drizzle + SQLite. Followed up with a large feature pass:
notification bell, post/help-request edit & delete, skill-match
auto-notifications, password reset + email verification (via a dev email
outbox, no real provider configured), rate limiting, profile photo/post
attachment uploads, admin analytics charts, audit log with search, and a
Vitest suite for the permission logic.

Then migrated the whole data layer from SQLite to Postgres (`pg` +
`drizzle-orm/node-postgres`) to support deploying on Render + Neon, fixing
the resulting Date-vs-string fallout across the UI. Got it live: pushed to
GitHub (after cleaning up an accidental old Prisma/NextAuth scaffold that
was sitting in the same repo), deployed via Render's Blueprint using
`render.yaml`, fixed a build break (`NODE_ENV=production` was stripping
devDependencies, breaking the Tailwind build), pushed the schema to Neon
with `drizzle-kit push`, and seeded demo data.

## 2026-08-30

Replaced the type-to-filter skill inputs (signup, profile edit, both
help-request forms) with a shared `SkillPicker` component — click to
browse all existing skills in a dropdown, filter by typing, still supports
adding a skill that isn't listed. Verified interactively with Playwright
screenshots before shipping.

Set up this file and `CLAUDE.md` itself, mirroring the working-rules
pattern from the LifeHub project, adapted for this stack's real
differences (manual `drizzle-kit push` after schema changes, since this
app — unlike LifeHub — doesn't auto-create tables on startup; the
Render build-step gotcha; the actual design tokens in `globals.css`).
Added `scripts\Update-CommitHistory.ps1` to make the commit-history
convention real rather than aspirational.

Redesigned the visual identity twice in response to direct feedback: first
from the original warm-cream/serif look (called out as generic) to a bold
forest-green/gold "pinboard" concept, then — after that also missed — to a
restrained Stripe/Linear/Notion-style aesthetic (neutral grays, one teal
accent, soft shadows, no illustration). Verified each with real Playwright
screenshots, not just code review.

Ran a 20-point site audit (broken links, SEO metadata, mobile menu,
favicon, 404 page, image compression, success/error messaging, mobile
overflow, etc.) against the actual codebase rather than assuming. Found
and fixed several real bugs this way, not just missing features: a file
input overflowing the page on mobile; several admin/help-request actions
that gave zero feedback on success *or* failure (one even silently
navigated away on error); and — the most serious one — the new mobile
hamburger menu was rendering at 64px tall instead of full-screen because
the nav's `backdrop-blur` created a new CSS containing block that broke
`position: fixed` for its portal-less overlay child. Fixed with a React
portal. Added a toast notification system, per-page metadata for all 16
routes, `sharp`-based upload compression (verified with a real test photo:
3MB → 916KB/56KB), and a dynamic-year footer with working links.
