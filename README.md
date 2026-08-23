# Casa Rustico

Brand apps for Casa Rustico coffee.

## Apps

| App | Path | Bundle ID |
|-----|------|-----------|
| **Espresso Escape** | [`apps/espresso-escape`](./apps/espresso-escape) | `com.jrod042.espressoescape` |
| **Casa Rustico Go** | [`apps/casa-rustico-go`](./apps/casa-rustico-go) | `com.jrod042.casarusticogo` |

**Go** is the customer shop: Colombia hero, origins, bag, rusticopr.com Shopify checkout, ritual timer, and house story.

## Run

```bash
cd apps/casa-rustico-go && npm install && npx expo start
cd apps/espresso-escape && npm install && npx expo start
```

## Docs

- [docs/APPS.md](./docs/APPS.md) — architecture, shop contract, submission
- [apps/casa-rustico-go/IOS.md](./apps/casa-rustico-go/IOS.md) — TestFlight / EAS
- [references/README.md](./references/README.md) — upstream open-source repos to study (not vendored)

## Catalog

Typed Shopify catalog (variant IDs for checkout) lives at `apps/casa-rustico-go/src/catalog.ts`.
