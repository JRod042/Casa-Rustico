# Casa Rustico mobile apps

Brand home: `Desktop/casa-rustico/`  
GitHub org repo: https://github.com/JRod042/Casa-Rustico

## Products

| App | Folder | Role | Store path |
|-----|--------|------|------------|
| **Espresso Escape** | `apps/espresso-escape/` | Casual coffee-themed game (bean run / barista timing) | EAS → TestFlight / Play |
| **Casa Rustico Go** | `apps/casa-rustico-go/` | Brand shop: Shopify catalog, bag, rusticopr.com checkout, ritual, story | EAS → TestFlight / Play |

Do not mix this shop with the HQ app in `JRod042/project-1`.

## Casa Rustico Go

Customer shop — not a restaurant HQ.

- **Tabs:** Home, Coffee, Ritual, Story. Bag is a FAB (not a tab).
- **Hero:** Colombia. Origins, capsules, house mug.
- **Cart:** AsyncStorage (`casa-rustico-go.v4`). No accounts.
- **Checkout:** Shopify cart permalinks `https://rusticopr.com/cart/{variantId}:{qty}`. Promo `MORNING10`.
- **Catalog:** `apps/casa-rustico-go/src/catalog.ts` (Shopify product + variant IDs).
- **Welcome:** Hallow-inspired dissolve (`src/welcome/`). Replay from Story.

EAS identity (do not change unless submitting a new build):

- Bundle `com.jrod042.casarusticogo`
- EAS project `25937717-3f2f-4793-af4d-79a12310f02a`
- GitHub Actions base directory `apps/casa-rustico-go`

## Architecture

```
Casa Rustico brand + Shopify catalog (rusticopr.com)
        │
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

Both apps use a **Hallow-inspired** welcome (Appllama study): splash loader dissolve → brand-first final surface, once per install (AsyncStorage).

- Go: `apps/casa-rustico-go/src/welcome/`
- Escape: `apps/espresso-escape/src/welcome/`

See `docs/WELCOME_SCREENS.md`. Clear the storage key (or **Replay intro** on Story) to replay.

## Submission

See `apps/casa-rustico-go/IOS.md`. Never change `eas.json` / bundle IDs / string build numbers unless bumping for a new TestFlight (`npm run bump:ios`).

GitHub → Expo: base directory **`apps/casa-rustico-go`**, profile **`production`**.
