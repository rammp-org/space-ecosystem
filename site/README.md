# SPACE site

Static site for the SPACE docs and decisions, styled with alex-style. The Markdown in the repo is the source; this folder only renders it.

```bash
cd site
npm install
npm run serve    # builds to dist/ and serves http://localhost:8765
```

Sources it reads:

| Source | Page |
|---|---|
| `docs/status.md` | Status (front matter `overrides` updates PRD requirement statuses) |
| `docs/architecture.md` | Architecture |
| `docs/adr/NNNN-*.md` | Decisions |
| `docs/nodes/*.md` | Nodes |
| `docs/open-questions.md` | Open questions |
| `PACE_ECOSYSTEM_PRD.md` | PRD v0.1 baseline (requirements, issues, roadmap are parsed from its tables) |
| `CONTEXT.md` | Glossary |

`assets/vendor/` is copied from `alex-style-guide/web/`. Re-copy it to pick up style changes.

`.github/workflows/pages.yml` builds and deploys on every push to `main`.
