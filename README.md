# Casa Rustico

Brand apps for Casa Rustico coffee.

## Apps

| App | Path | Kind |
|-----|------|------|
| **Casa Rústico Hacienda** | [`apps/hacienda`](./apps/hacienda) | Web PWA — order ahead, scan, rewards |
| **Casa Rustico Go** | [`apps/casa-rustico-go`](./apps/casa-rustico-go) | Expo — shop, bag, rusticopr.com checkout |
| **Espresso Escape** | [`apps/espresso-escape`](./apps/espresso-escape) | Expo — coffee-themed game |

**Hacienda** is the café: Home, Order, Scan, Gift, Stores, Hacienda Rewards beans.

**Go** is the customer shop: Colombia hero, origins, bag, rusticopr.com Shopify checkout, ritual timer, and house story.

## Run

```bash
cd apps/hacienda && npm install && npm run dev
cd apps/casa-rustico-go && npm install && npx expo start
cd apps/espresso-escape && npm install && npx expo start
```

## Docs

- [apps/hacienda/README.md](./apps/hacienda/README.md) — order-ahead web app
- [docs/APPS.md](./docs/APPS.md) — architecture, shop contract, submission
- [apps/casa-rustico-go/IOS.md](./apps/casa-rustico-go/IOS.md) — TestFlight / EAS
- [references/README.md](./references/README.md) — upstream open-source repos to study (not vendored)

## Catalog

- Web menu: `apps/hacienda/src/lib/catalog.ts`
- Shopify catalog (variant IDs for checkout): `apps/casa-rustico-go/src/catalog.ts`
