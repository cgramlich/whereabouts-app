# CLAUDE.md - Whereabouts App (frontend)

Auto-read by Claude Code at session start. Keep it current.

**Doc currency (see starter spec §5):** keep this file + the architecture doc in step
with the code in the SAME session you change code. Don't hardcode the version here
(point to `APP_VERSION`/`BUILD` + the backend `/health`); update the doc body when the
architecture changes; write a DATED entry in the app's Log folder for EVERY work session:
`C:\Users\cjgra\Dropbox\My AI\CG Apps\Whereabouts\Whereabouts Log\`.
Rule: `CG Apps\Forever Apps\forever-apps-starter-spec.md` section 5.

## Code readability (Chris's directive 2026-08-10) - part of "done"
This code has to be readable by three people who were not in the room when it was
written: a human AUDITOR reconstructing what the system does, a REGULATOR asking
"show me where that rule is implemented", and a DEVELOPER JOINING COLD. If any of
them has to ask "why is this here?", the code has failed - whether or not it works.
Treat this as part of the definition of done, alongside "it compiles" and "it is
deployed". It is not polish to add later.

- **Comment the WHY and the RULE, never the WHAT.** The test: a good comment is still
  true after someone rewrites the implementation. If it only narrates the current
  lines, delete it.
- **Every business rule is stated in plain English beside the code enforcing it**, so a
  reviewer reads the rule and sees the code without inferring it from the logic. Say
  where the rule comes from (custody agreement, household policy, a decision Chris made)
  and date it. The `placementAt` precedence chain and the custody rotations are exactly
  the kind of rule that must read in English right beside the code.
- **Non-obvious decisions record the road not taken** - what was rejected and why - so a
  later session doesn't "fix" a deliberate choice (the three-state home/expected/unusual
  model, and routines being editable DATA rather than code, both qualify).
- **Anything surprising gets a WARNING comment** where someone would trip over it:
  load-bearing quirks, footguns, things that fail silently.
- **Files open with an orientation block** (what this file is, what it owns, what it
  deliberately does not do), and long files are split into labelled banner sections
  (`AUTH`, `RESOLVER`, `VIEWS`, `SYNC`). Matters most in `index.html`, which runs to
  thousands of lines by design.
- **Names are the documentation**; explicit over clever, always. Don't golf.
- **Dead code is deleted, not commented out.** Git remembers.

Guard the opposite failure just as hard: NOT a comment per line, NOT the code restated
in English, NOT ceremonial docblocks, NOT commit-message content in comments (who
changed what and when is git's job). Noise buries signal and teaches the reader to skip
comments, including the one that mattered. Restructure unclear code rather than
apologizing for it in a comment.

Full standard (the authority, read it):
`C:\Users\cjgra\Dropbox\My AI\CG Apps\Forever Apps\CODE-READABILITY-STANDARD.md`

## Pre-push audit gate (never bypass)
`git push` runs the shared checker `C:\Users\cjgra\portfolio-audit\portfolio_audit.py`
through `.git\hooks\pre-push`. Backend checks BLOCK the push; the frontend checks are
advisory (print-only) for now. Run it ad hoc any time with `--all`.

It exists because these specific failures actually happened:
- a model that was routed but had no price entry took PriorityCaptain's AI relay fully
  offline;
- a duplicate dict key made FitnessCaptain meter Sonnet 5 at Haiku's rate, so the budget
  breaker sailed past roughly 3x the real spend;
- a typo in a Railway numeric variable crash-loops a backend at import.

`--no-verify` is NOT an acceptable workaround - it is already against Chris's standing
rule. If the gate is wrong, fix the checker; don't push around it.

## What this is
Whereabouts frontend: a SINGLE-FILE HTML PWA (React via CDN + Babel standalone,
no build step) - a Forever Apps family "planned location" calendar (where each
person/pet is intended to be across day/week/month/year; not events, not GPS).
Cloned from the Tracker template. Five views + the client-side `placementAt`
resolver (pin > journey > trip > custody > rule precedence), data-entry UI for
pin/trip/journey. Backend is a SEPARATE repo (`whereabouts-backend`, FastAPI -
security-hardened but NOT yet deployed).

## Coordinates
- Repo: `cgramlich/whereabouts-app` (public). GitHub username is `cgramlich`
  (no "j" - easy to mistype as the email handle cjgramlich).
- Live URL: https://cgramlich.github.io/whereabouts-app/ (GitHub Pages from
  `main`/root). Currently LOCAL-PREVIEW mode: `API_BASE` in `index.html` is still
  the placeholder until the backend deploys (Supabase/Railway) and keys are set.
- Deploy: push to `main` -> Pages redeploys.
- The app is one file: `index.html`. Deliverable file name is exactly `index.html`.
- Version: source of truth = `APP_VERSION` (friendly label) + `BUILD`
  ("YYYY-MM-DD.N" - what the updater compares) in `index.html`, plus `VERSION` in
  `sw.js` in lockstep. Bump on EVERY deploy or installed users silently never
  update. Do NOT hardcode the current number in this doc - it drifts.

## Verify before delivering
- Run the JSX through Babel standalone to confirm it transforms cleanly BEFORE
  delivering, then content-grep each change.
- For automated edits, assert each anchor string appears EXACTLY ONCE before
  replacing.
- One change set per deploy.

## How Chris works
- Plain-English feedback; you read the code and make edits directly. Iterate freely.
- Ask before building: feature work gets a SHORT proposal + sign-off first. One
  step at a time; wait for confirmation.
- Debug logs-first: ask for console output / network response / screenshot before
  theorizing. Do not guess.
- Direct, no hedging. Production-ready, not demos.
- Commands handed to Chris: ONE per code block, never grouped, wait for output.
- Environment: Windows 11. Keep console/log output ASCII-safe (no emoji).

## Reference docs (read for full context; keep in sync)
- Whereabouts START-HERE: `CG Apps\Whereabouts\START-HERE-whereabouts.md`
- Handoff (design spec): `CG Apps\Whereabouts\whereabouts-handoff.md`
- Architecture: `CG Apps\Whereabouts\whereabouts-architecture.md`
- Backend CLAUDE.md: `C:\Users\cjgra\whereabouts-backend\CLAUDE.md`
- Forever Apps starter spec: `CG Apps\Forever Apps\forever-apps-starter-spec.md`
