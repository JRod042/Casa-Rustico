# Casa Rústico brand apps — Grok Build / Cursor

**Products:** Casa Rústico Hacienda (web café), Casa Rustico Go (Expo shop), Espresso Escape (game).

## Hard constraints

- iPhone / iPad only for Expo apps. No Linux host, no Mac, no OpenClaw.
- Expo builds via EAS → TestFlight.
- GitHub Actions base directory is `apps/casa-rustico-go` or `apps/espresso-escape` — never repo root.
- Do not ship `references/` as product code.
- Never overwrite Expo `eas.json` / bundle IDs when editing the web app.

## Repos

- This repo: brand apps
- https://github.com/JRod042/project-1 — house HQ / TestFlight shell (separate product)

## Hacienda (web)

Order-ahead café PWA in `apps/hacienda`. Tabs: Home, Order, Scan, Gift, Stores. Auth + per-user rewards, wallet, gifts. Not Shopify checkout.

## Go shop

Customer coffee shop for rusticopr.com. Colombia hero, bag, Shopify checkout permalinks, Hacienda Rewards, scan card, gift, stores. Ritual and story stay in-app. Cart is on-device.

## Engineering

1. Never break `eas.json` / bundle IDs / string build numbers.
2. Keep welcome screens brand-original (Appllama is reference only).
3. Prefer small, reviewable changes.
