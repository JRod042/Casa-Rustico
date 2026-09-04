# Casa Rustico mobile apps

Brand home: `Desktop/casa-rustico/`  
GitHub org repo: https://github.com/JRod042/Casa-Rustico

## Products

| App | Folder | Role | Store path |
|-----|--------|------|------------|
| **Casa Rústico Hacienda** | `apps/hacienda/` | Order-ahead café PWA: rewards, scan, gifts, stores | Web / Vercel |
| **Espresso Escape** | `apps/espresso-escape/` | Casual coffee-themed game (bean run / barista timing) | EAS → TestFlight / Play |
| **Casa Rustico Go** | `apps/casa-rustico-go/` | Brand shop: Shopify catalog, bag, rusticopr.com checkout, ritual, story | EAS → TestFlight / Play |

Do not mix this shop with the HQ app in `JRod042/project-1`.

## Casa Rústico Hacienda

Café order-ahead — not Shopify checkout.

- **Tabs:** Home, Order, Scan, Gift, Stores. Account is the avatar, not a tab.
- **Rewards:** Hacienda beans, Cosecha / Hacienda tiers, wallet, member barcode.
- **Catalog:** `apps/hacienda/src/lib/catalog.ts`
- **Auth:** email + Google / X. Orders, gifts, and beans are per signed-in user.

## Casa Rustico Go

Customer shop — not a restaurant HQ.

- **Tabs:** Home, Order, Scan, Gift, Stores. Bag is a FAB (not a tab). Ritual and Story live on Home / Account.
- **Hero:** Colombia. Origins, capsules, house mug.
- **Cart:** AsyncStorage (`casa-rustico-go.v4`). Shopify checkout permalinks.
- **Rewards:** Hacienda Rewards on-device (`casa-rustico-go.member.v1`). Join with name + email. Beans on checkout. Casa card in Scan.
- **Checkout:** Shopify cart permalinks `https://rusticopr.com/cart/{variantId}:{qty}`. Promo `MORNING10`.
- **Catalog:** `apps/casa-rustico-go/src/catalog.ts` (Shopify product + variant IDs).
- **Welcome:** Hallow-inspired dissolve (`src/welcome/`). Replay from Story.

EAS identity (do not change slugs or bundle IDs unless Apple/Expo require it):

| Expo project (`@jrod42/…`) | Git folder | slug / scheme | iOS bundle + Android package | EAS projectId | Marketing version / build |
|---|---|---|---|---|---|
| **espresso-escape** | `apps/espresso-escape` | `espresso-escape` / `espressoescape` | `com.jrod042.espressoescape` | `016d7c24-a7df-4e0d-8e59-00a9d8db352c` | `1.0.3` / iOS `8` · Android `8` |
| **casa-rustico-go** | `apps/casa-rustico-go` | `casa-rustico-go` / `casarusticogo` | `com.jrod042.casarusticogo` | `25937717-3f2f-4793-af4d-79a12310f02a` | `1.0.0` / iOS `4` · Android `4` |

GitHub Actions base directory is the folder in that table — never repo root.

Related, **not** in this repo:

| Expo project | GitHub | slug | bundle |
|---|---|---|---|
| Casa Rustico (coffee shop / HQ) | `JRod042/project-1` `mobile/` | `omni` | `com.jrod042.omni` (build 49) |
| `casa-r-stico-go` | none | stray empty Expo project — do not ship | — |

Do not point Expo **espresso-escape** or **casa-rustico-go** at `project-1`. Do not use IAP in Escape (physical coffee is sold on rusticopr.com via Go / Hacienda, not this game).

## Architecture

```
Casa Rustico brand + Shopify catalog (rusticopr.com)
        │
        ├── hacienda         (web café / rewards / scan)
        ├── casa-rustico-go  (shop / bag / ritual / story)
        └── espresso-escape  (game)
```

## Reference repos (cloned under `references/`)

| Repo | Use for |
|------|---------|
| [Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens) | Animated splash / welcome motion studies (GPL; educational only) |
| [EvanBacon/Expo-Crossy-Road](https://github.com/EvanBacon/Expo-Crossy-Road) | Expo + Three.js game scaffolding |
| [EvanBacon/pillar-valley](https://github.com/EvanBacon/pillar-valley) | Expo game polish / menus |
| [k1rana/jokopi-react](https://github.com/k1rana/jokopi-react) | Coffee order / menu UX |
| [Asatelit/pwa-pos-terminal](https://github.com/Asatelit/pwa-pos-terminal) | Cart / counter patterns |

Do **not** ship references as-is — study patterns only; product code lives in `apps/`.

## First-launch welcome

Both Expo apps use a **Hallow-inspired** welcome (Appllama study): splash loader dissolve → brand-first final surface, once per install (AsyncStorage).

- Go: `apps/casa-rustico-go/src/welcome/`
- Escape: `apps/espresso-escape/src/welcome/`

See `docs/WELCOME_SCREENS.md`. Clear the storage key (or **Replay intro** on Story) to replay.

## Submission

- Go: `apps/casa-rustico-go/IOS.md`
- Escape: `apps/espresso-escape/IOS.md`

Never change `eas.json` / bundle IDs / string build numbers unless bumping for a new store binary (`npm run bump:ios`).

GitHub → Expo: base directory **`apps/espresso-escape`** or **`apps/casa-rustico-go`**, profile **`production`**, platform **ios** or **all**.
