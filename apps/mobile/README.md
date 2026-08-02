# Casa Rústico — mobile

Expo React Native storefront for iOS and Android.

## Scripts

| Command | Purpose |
|---|---|
| `npm run start` | Metro / Expo dev server |
| `npm run ios` | Open iOS simulator workflow |
| `npm run android` | Open Android emulator workflow |
| `npm run typecheck` | TypeScript check |
| `npm run prebuild` | Generate native `ios/` / `android/` for Checkout Kit |

## Env

Copy `.env.example` → `.env` and set `EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`.

## Screens

- Home — brand hero + featured collection
- Shop — All / Coffee / Merch
- Product — variants, add to cart
- Cart — line items + Checkout Kit
- About — brand + fulfillment note
