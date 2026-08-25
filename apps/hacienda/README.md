# Casa Rústico Hacienda

Order-ahead web app for Casa Rústico — Home, Order, Scan, Gift, Stores, and Account. Hacienda Rewards beans, wallet, and gift cards.

This is the **café PWA**, not the Expo shop. Shopify checkout still lives in [`apps/casa-rustico-go`](../casa-rustico-go).

## Run

```bash
npm install
npm run dev
```

Requires Node 22. Bind is `0.0.0.0:8080`.

## Stack

- TanStack Start + React 19 + Tailwind v4
- Better Auth (email + Google / X)
- Postgres in production; PGLite for local/dev
- Per-user rewards, orders, wallet, gifts

## Tabs

| Tab | What it does |
|-----|----------------|
| Home | Greeting, rewards card, offers, featured cups |
| Order | Menu, customization, bag, pay with wallet or card |
| Scan | Member barcode + in-store pay |
| Gift | Kraft / forest gift cards |
| Stores | New Orleans, Hammond, Baytown, San Juan |

Sign in from Account (or the guest rewards card) to earn beans and keep orders.

## Catalog

Typed menu is [`src/lib/catalog.ts`](./src/lib/catalog.ts). Hero lot is Colombia. Bags and merch sit beside café drinks.
