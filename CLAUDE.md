# CLAUDE.md — Working rules for this project

This file documents how Claude and the project owner (HP) work together on
au_youth (AU Youth Engagement & Skills Platform). Read this first in any new
session before making changes.

## Project basics

- Local folder: `C:\Users\HP\projects\au-youth-platform`
- GitHub repo: https://github.com/zementaye/au_youth (branch: `main`)
- Deployed on Render as the `au-youth-platform` web service, **Free plan**
  (no persistent disk). Auto-deploys from `main` — pushing is enough,
  no manual trigger needed (confirmed: pushing `render.yaml` fixes during
  setup produced a new build automatically each time).
- Database: Neon Postgres (Free tier, Oregon region — matches Render's
  `oregon` region in `render.yaml` to keep latency low).
- Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Drizzle
  ORM + `pg` (node-postgres) driver. Server Actions handle almost all
  mutations (`src/lib/actions/*.ts`) rather than a separate API-route layer.
  There **is** a build step (`npm run build`), unlike a plain Flask/Jinja
  app — see the Render section below for a gotcha specific to this.
- File storage (profile photos, post attachments): local disk via the
  `UPLOAD_DIR` env var (defaults to a top-level `uploads/` folder), served
  through the `/uploads/[filename]` route handler. **Render's Free plan has
  no persistent disk attached**, so uploaded files are wiped on every
  redeploy or restart. This is a known, accepted limitation for now —
  don't add a paid-plan disk block to `render.yaml` without HP asking for it.

### Database schema changes do NOT happen automatically

This is the single most important operational difference from a typical
Flask/SQLite app: **this app does not create or migrate tables on startup.**
After any change to `src/db/schema.ts`, you must run, from HP's machine,
against the real Neon database:

```powershell
$env:DATABASE_URL="<Neon connection string>"
npx drizzle-kit push
```

Skipping this step is exactly how we hit a live `relation "skills" does not
exist` error after the first deploy — the build succeeded, the app was
live, but Postgres had no tables yet. Always call this out explicitly as a
required step whenever a schema change ships, and remind HP to run it
**before or right after** the next deploy, not "eventually."

- Use the **direct/unpooled** Neon connection string for `drizzle-kit push`
  and any one-off seed scripts run from HP's machine.
- Use the **pooled** Neon connection string for the `DATABASE_URL` set in
  Render's dashboard (the live app).

### Render build gotcha already fixed once — don't reintroduce it

Do not add `NODE_ENV=production` as a build-time env var in `render.yaml`.
npm interprets that as "skip devDependencies," which silently drops
`@tailwindcss/postcss` and breaks the build with a cryptic
`Cannot find module '@tailwindcss/postcss'` error. The working
`buildCommand` is:

```yaml
buildCommand: npm install --include=dev && npm run build
```

Next.js sets its own `NODE_ENV` internally at build/start time — we don't
need to set it ourselves.

## The shell is always PowerShell

HP works on Windows. **Every command given for local execution — from
unzipping a delivered file all the way through to `git push` — must be
PowerShell**, never bash/cmd/WSL syntax. That covers things like:

- `Expand-Archive` (not `unzip`)
- `Copy-Item` (not `cp`)
- `Remove-Item` (not `rm`)
- `$env:VAR="value"` (not `export VAR=value`), and remember that PowerShell
  requires the whole value in quotes if it contains an `&` (Neon connection
  strings do, via `&channel_binding=require`)
- `D:\Chrome_Downloads\...` style paths — HP's browser download folder is
  `D:\Chrome_Downloads`, not the OS default `Downloads` folder

**All commands for a given step go in a single code block**, not split
across several separate blocks — one copy-paste, not many.

## The end-to-end push workflow

When Claude makes code changes in a session, the deliverable is a zip
containing only the changed files (preserving their folder structure, e.g.
`au-youth-platform/src/components/SkillPicker.tsx`). The standard flow HP
follows to get that into the real repo is:

```powershell
cd C:\Users\HP\projects\au-youth-platform

# 1. Unzip the delivered file (adjust the filename to match what was downloaded)
Expand-Archive -Path "D:\Chrome_Downloads\<name>.zip" -DestinationPath "D:\Chrome_Downloads\<name>" -Force

# 2. Sanity-check the extracted contents BEFORE copying anything —
#    this project has already hit two folder-structure mistakes
#    (a nested duplicate folder, and a missing render.yaml) that a
#    5-second look here would have caught immediately.
Get-ChildItem -Recurse "D:\Chrome_Downloads\<name>"

# 3. Copy only the changed files over (one Copy-Item per file, matching folders)
Copy-Item "D:\Chrome_Downloads\<name>\<path\to\file>" -Destination .\<path\to\> -Force

# 4. Review before committing
git status
git diff

# 5. Commit and push
git add <changed files>
git commit -m "<clear, specific message>"
git push
```

Rules for this flow:

- Claude always lists out the exact `Copy-Item` commands for each changed
  file — never a blind folder copy that could overwrite unrelated files.
- Each delivered zip gets a unique filename — never reuse the same zip name
  across deliverables in a session or across sessions, so old downloads in
  `D:\Chrome_Downloads` don't get confused with new ones.
- HP reviews `git diff` before committing. Claude should tell them what to
  look for if it isn't obvious.
- Commit messages are short, specific, and describe the change (not "update
  files").
- The `LF will be replaced by CRLF` warnings from Git on Windows are
  harmless and can be ignored.
- After `git diff`, press `q` to exit the pager if it opens one.
- If a schema change is part of the delivery, the commit/push steps above
  are not the finish line — remind HP to also run `drizzle-kit push`
  against Neon (see "Database schema changes" above).

## History tracking

Two files in this repo exist purely to keep a record over time, and both
need to stay current:

- **`COMMIT_HISTORY.md`** — a plain log of git commits with dates. It's
  regenerated from the real `git log`, never hand-typed, so it's always
  accurate. Run `scripts\Update-CommitHistory.ps1` after pushing to refresh
  it, then commit that file too (small follow-up commit is fine).
- **`CHAT_HISTORY.md`** — a running summary of what was discussed and built
  in each Claude session, in HP's own project. This is *not* generated from
  git — Claude should append a new dated entry to it near the end of any
  session where real work happened (a feature built, a decision made, a
  bug fixed, a deployment issue resolved), summarizing what changed and
  why. Keep entries short — a few lines per session, not a transcript.

When asked to "remember" a rule or convention going forward, it goes in
*this* file (CLAUDE.md), not CHAT_HISTORY.md — CLAUDE.md is the rulebook,
CHAT_HISTORY.md is the log.

## Design and code conventions established so far

- **Design tokens** live in `src/app/globals.css` under `:root` — match
  these instead of introducing new colors/fonts. Redesigned 2026-08-30 (the
  previous cream/serif/terracotta look read as a generic AI-template
  aesthetic and was replaced outright):
  - Colors: `--ink` (#14171a), `--ink-soft`, `--paper` (#ffffff, no longer
    cream), `--paper-raised`, `--gold` (mustard amber, #e8a317), `--coral`
    (berry, #a31545), `--sage` (continental blue, #1e3fe0), `--forest`
    (palm green, #12603f), `--line`, `--line-soft`.
  - Fonts: Space Grotesk (display/headings), IBM Plex Sans (body), IBM
    Plex Mono (meta/labels) — self-hosted via `@fontsource` packages, not
    the Google Fonts CDN. Fraunces/Inter were dropped entirely.
  - Shape language: sharp corners everywhere (`rounded-full` pills and
    `rounded-lg`/`rounded-md` cards were replaced app-wide) — the only
    circles left are avatars and status dots. Buttons use the `.btn` /
    `.btn-primary` / `.btn-outline` classes (hard offset shadow that tucks
    in on hover). Cards use `.card-raised` (flat white, 1px ink border,
    4px colored spine on the left edge, cycling sage/gold/coral). Form
    inputs use `.input` (this class was referenced across ~8 form files
    but was never actually defined before this pass — it now has a real
    style; if a future form field looks unstyled, check this class first
    rather than assuming it's already handled).
  - Signature visual motif: a **woven strip** — departments rendered as
    solid color bands stacked edge to edge (`.strip` utility class for the
    thin 4-color bar used in the nav and footer; see `NetworkSignature` in
    `src/app/page.tsx` for the full department-strip version). This
    replaces the old dotted radial "network" diagram (`.node-dot`,
    `.node-line` are still defined for compatibility but are no longer the
    primary signature — reach for the strip motif first).
- **Server Actions over API routes** for mutations — see `src/lib/actions/`
  for the existing pattern (one file per feature area: `auth.ts`, `posts.ts`,
  `help-requests.ts`, `profile.ts`, `admin.ts`, `notifications.ts`).
- **Permission logic is centralized and unit-tested** in
  `src/lib/permissions.ts` (`canPost`, `canPostPlatformWide`,
  `isDeptAdminOf`). New role/permission rules belong there, not duplicated
  inline in actions or pages — it's covered by `src/lib/__tests__/`, run
  `npm test` after touching it.
- **Skill multi-select** is a shared component: `src/components/SkillPicker.tsx`.
  Reuse it for any future "pick multiple from a list, or add a new one"
  input rather than building a new tag-input from scratch.
- **Date formatting** goes through `src/lib/format.ts`
  (`formatDate` / `formatShortDate` / `formatDateTime`). Postgres timestamp
  columns come back as real JS `Date` objects (not strings) — don't
  reintroduce string-parsing hacks.
- **File uploads** go through `src/lib/upload.ts`'s `saveUpload()` plus the
  `/uploads/[filename]` route handler — don't hardcode upload paths
  elsewhere.
- **Email is not really sent yet.** `src/lib/mailer.ts`'s `sendEmail()`
  writes to a `dev_emails` table instead of calling a real provider,
  viewable at `/admin/outbox` (Super Admin only). Any new feature that
  sends an email should call `sendEmail()`, not assume real delivery —
  swapping in Resend/SendGrid later only requires changing that one
  function's body.
- New Drizzle tables/columns are added directly in `src/db/schema.ts`
  (pg-core) — remember the manual `drizzle-kit push` step above, since
  nothing runs migrations automatically.
