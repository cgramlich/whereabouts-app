# CLAUDE.md - Whereabouts App (frontend)

Auto-read by Claude Code at session start. Keep it current.

**Doc currency (see starter spec §5):** keep this file + the architecture doc in step
with the code in the SAME session you change code. Don't hardcode the version here
(point to `APP_VERSION`/`BUILD` + the backend `/health`); update the doc body when the
architecture changes; write a DATED entry in the app's Log folder for EVERY work session:
`C:\Users\cjgra\Dropbox\My AI\CG Apps\Whereabouts\Whereabouts Log\`.
Rule: `CG Apps\Forever Apps\forever-apps-starter-spec.md` section 5.

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
