# SPACE Ecosystem

Product and ecosystem-level documentation for SPACE (Sensing, Power, Actuation,
and Control Electronics), named PACE until 2026-10 (ADR-0001). `PACE_ECOSYSTEM_PRD.md`
is the v0.1 baseline; current status is `docs/status.md`, open and settled questions are `docs/decisions/`
(one file per question, status open/leaning/decided/parked), modules and applications are
`docs/nodes/`, and the overview from the October deck is `docs/overview.md`.

The team reads all of this through the static site in `site/` (`cd site && npm run serve`),
deployed to GitHub Pages by `.github/workflows/pages.yml`. When you add or change a doc,
rebuild the site and check the page renders. Prose follows the deslop rules. Board and firmware source lives
in sibling repos (`../pace-racer/pace-racer-fw`, `../pace-abc/ATOS-Bridge-Comms`).

## Agent skills

### Issue tracker

Local markdown: issues and specs live under `.scratch/<feature>/` in this repo.
See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the root. Decisions live in `docs/decisions/`, not `docs/adr/`.
See `docs/agents/domain.md`.
