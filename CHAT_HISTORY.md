
## 2026-08-30 — Full UI redesign
Replaced the site-wide visual design: the previous cream/serif/terracotta
look was too close to a generic AI-template aesthetic. New system: white
canvas, Space Grotesk + IBM Plex Sans/Mono, sharp corners throughout
(no more rounded-full pills), and a new "woven strip" signature motif
(departments as color bands) replacing the dotted network diagram. Also
fixed a bug where `.input` was referenced across ~8 form files but never
defined in globals.css — form fields had no styling at all. 34 files
touched; see CLAUDE.md's design-conventions section for the new tokens.
