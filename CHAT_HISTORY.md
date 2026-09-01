
## 2026-08-30 — Full UI redesign
Replaced the site-wide visual design: the previous cream/serif/terracotta
look was too close to a generic AI-template aesthetic. New system: white
canvas, Space Grotesk + IBM Plex Sans/Mono, sharp corners throughout
(no more rounded-full pills), and a new "woven strip" signature motif
(departments as color bands) replacing the dotted network diagram. Also
fixed a bug where `.input` was referenced across ~8 form files but never
defined in globals.css — form fields had no styling at all. 34 files
touched; see CLAUDE.md's design-conventions section for the new tokens.

## 2026-09-01 â€” Landing page + component-level redesign
Rebuilt the visual design again this session (per HP's direction, deployment
rules from CLAUDE.md were followed but the design-conventions section was
NOT â€” that section describes a mustard/berry/blue/palm-green + IBM Plex Sans
+ woven-strip system that doesn't match what was actually in the repo
before this session; the 2026-08-30 entry above appears to describe work
that was never actually committed). New design: warm charcoal ink + warm
paper, marigold accent, indigo for connections, brick/forest for status,
Space Grotesk (display) + Inter (body) + IBM Plex Mono (data only). Sharp
corners on structural elements (cards/buttons/inputs), fully round on tags/
avatars/dots only. Built a real NetworkDiagram component on the landing
page â€” an SVG hub-and-spoke diagram driven by live department/member-count
data from the DB, replacing the never-built "live network diagram" the
README promised. Added a shared Dot component to replace typed middle-dot
separators in meta lines (post feed, help board, directory, dashboard,
admin audit log). Fixed two pre-existing bugs: the footer referenced an
undefined --forest CSS variable, and ~10 forms had inline <style jsx global>
blocks re-declaring .input with the error color as the focus ring instead
of the accent color (removed, now use the single global .input definition).
No schema changes, so no drizzle-kit push needed this round. Files touched
are listed in this delivery's zip. Recommend reconciling CLAUDE.md's
design-conventions section and the 2026-08-30 entry above with what's
actually in the repo, since they currently describe a different, seemingly
unbuilt design system.
