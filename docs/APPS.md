# Casa Rustico mobile apps

Brand home: `Desktop/casa-rustico/`  
GitHub org repo: https://github.com/JRod042/Casa-Rustico

## Products

| App | Folder | Role | Store path |
|-----|--------|------|------------|
| **Espresso Escape** | `apps/espresso-escape/` | Casual coffee-themed game (bean run / barista timing) | EAS → TestFlight / Play |
| **Casa Rustico Go** | `apps/casa-rustico-go/` | Brand shop: single-origin catalog, story, reorder | EAS → TestFlight / Play |

Both share Casa Rustico visual identity (labels under `Single Origin Labels/`, product JSON in repo root).

## Architecture (merged)

```
Casa Rustico brand assets + dripshipper catalog
        │
        ├── casa-rustico-go  (commerce / loyalty shell)
        │       └── deep-link rewards ←── espresso-escape
        └── espresso-escape  (game loop + rewards)
```

## Reference repos (cloned under `references/`)

| Repo | Use for |
|------|---------|
| [Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens) | Animated splash / welcome motion studies (GPL; educational only) |
| [EvanBacon/Expo-Crossy-Road](https://github.com/EvanBacon/Expo-Crossy-Road) | Expo + Three.js game scaffolding |
| [EvanBacon/pillar-valley](https://github.com/EvanBacon/pillar-valley) | Expo game polish / menus |
| [k1rana/jokopi-react](https://github.com/k1rana/jokopi-react) | Coffee order / menu UX |
| [Asatelit/pwa-pos-terminal](https://github.com/Asatelit/pwa-pos-terminal) | Cart / counter patterns |
| [amahim/espresso-escape](https://github.com/amahim/espresso-escape) | Named coffee-store client/server split |

Do **not** ship references as-is — study patterns only; product code lives in `apps/`.

## First-launch welcome

Both apps show an original Casa-branded welcome (splash + short pages) once, then persist via AsyncStorage:

- Go: `apps/casa-rustico-go/src/welcome/`
- Escape: `apps/espresso-escape/src/welcome/`

Clear the storage key (or reinstall) to replay.

## Local brand data to wire

- `dripshipper-single-origin.json` — product SKUs / descriptions  
- `Single Origin Labels/` — bag art  
- `passive-income/shopify/` — storefront / brand notes  

## Next (submission)

1. `cd apps/casa-rustico-go && npx eas init` (or link existing Expo project)  
2. Same for `espresso-escape`  
3. Set bundle IDs, icons, privacy strings  
4. `eas build --platform ios --profile production`  
5. Submit with ASC credentials (same team as Omni if desired)

## Expo / GitHub login on this host

CLI still showed **Not logged in** from agent shells. On your machine:

```bash
npx eas-cli login
gh auth login
```

Then re-run listing:

```bash
npx eas-cli project:list
eas build:list
```
