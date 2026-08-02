# Casa Rústico

Standalone iOS + Android app for [rusticopr.com](https://rusticopr.com), built with Expo and Shopify Storefront API + Checkout Kit.

Shopify remains the system of record for catalog, checkout, payments, orders, and fulfillment (Dripshipper coffee + Printful merch). The Liquid website and this app share the same store.

## Repo layout

```
apps/mobile/     Expo (React Native) storefront — iOS & Android
docs/            Setup and architecture notes
```

## Quick start

```bash
cd apps/mobile
cp .env.example .env
# Add EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN from Shopify admin
npm install
npm run start
```

Checkout Kit requires a **development build** or EAS build (not Expo Go). Catalog browsing can be developed against the Storefront API; checkout presentation uses `@shopify/checkout-sheet-kit` with an in-app browser fallback.

See [docs/SETUP.md](docs/SETUP.md) for Shopify scopes, tokens, and build steps.

## Architecture (Option A)

- **Expo + React Native** — one codebase for iOS and Android
- **Storefront API (GraphQL)** — products, collections, cart
- **Checkout Kit** — native Shopify checkout sheet (Shop Pay / wallets)
- **Website merge** — same Shopify store as rusticopr.com; universal links prepared for `/products` and `/collections`
