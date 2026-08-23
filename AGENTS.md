# Casa Rústico brand apps — Grok Build / Cursor

**Products:** Casa Rustico Go (shop) and Espresso Escape (game).

## Hard constraints

- iPhone / iPad only. No Linux host, no Mac, no OpenClaw.
- Builds via Expo EAS → TestFlight.
- GitHub Actions base directory is `apps/casa-rustico-go` or `apps/espresso-escape` — never repo root.
- Do not ship `references/` as product code.

## Repos

- This repo: brand apps
- https://github.com/JRod042/project-1 — house HQ / TestFlight shell

## Engineering

1. Never break `eas.json` / bundle IDs / string build numbers.
2. Keep welcome screens brand-original (Appllama is reference only).
3. Prefer small, reviewable changes.
