# Casa Rústico mobile — setup

## 1. Shopify custom app (Storefront API)

1. In Shopify admin for `b84a47-3.myshopify.com` / rusticopr.com: **Settings → Apps and sales channels → Develop apps**.
2. Create an app (e.g. `Casa Rustico Mobile`).
3. Configure **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
4. Install the app on the store and copy the **Storefront API public access token**.
5. Put it in `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=b84a47-3.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=shpat_or_storefront_token_here
EXPO_PUBLIC_SHOPIFY_API_VERSION=2026-01
```

Custom domain `rusticopr.com` works for storefront browsing; GraphQL calls use the `*.myshopify.com` domain above.

## 2. Run locally

```bash
cd apps/mobile
npm install
npm run start
```

- **Expo Go**: catalog UI may load; Checkout Kit native module will not. The app falls back to opening `checkoutUrl` in an in-app browser so orders still hit Shopify fulfillment.
- **Dev / production builds**: use EAS or `npx expo prebuild` + Xcode / Android Studio so `@shopify/checkout-sheet-kit` runs natively.

```bash
# Example EAS (after eas-cli login + project init)
cd apps/mobile
npx eas build --platform all --profile development
```

## 3. Fulfillment (no app work)

Orders created through Checkout Kit are normal Shopify orders:

| Product type | Partner | Already wired |
|---|---|---|
| Coffee bags / capsules | Dripshipper | Yes (`dripshipper` tags) |
| Mugs / glass | Printful | Yes (`printful` tags) |
| Hoodies | Printful / POD SKUs | Yes |

Do not re-implement fulfillment in the mobile app.

## 4. Website merge

- Keep Debut Liquid on rusticopr.com for SEO.
- App deep links prepared in `app.json` for `https://rusticopr.com/products/*` and `/collections/*`.
- Add Apple App Site Association + Android Digital Asset Links when store listings are ready.

## 5. Reference repos (Option A)

- [Shopify/example-mobile--storefront--react-native](https://github.com/Shopify/example-mobile--storefront--react-native)
- [Shopify/checkout-sheet-kit-react-native](https://github.com/Shopify/checkout-sheet-kit-react-native)
- Docs: [Mobile commerce](https://shopify.dev/docs/storefronts/mobile)

## 6. Next credentials (later phases)

- Customer Account API (login / order history)
- Apple Developer + Google Play accounts
- Expo / EAS project ID
- Push notification certs + Shopify order webhooks
