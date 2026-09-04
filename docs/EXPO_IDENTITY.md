# Expo ↔ git identity

Both brand Expo apps live in **this** repo (`JRod042/Casa-Rustico`). The coffee-shop HQ app is a different repo.

## In this repo

| Product | Expo slug | Expo owner / projectId | Git path | iOS `bundleIdentifier` | Android `package` | URL scheme |
|---|---|---|---|---|---|---|
| Espresso Escape | `espresso-escape` | `@jrod42` / `016d7c24-a7df-4e0d-8e59-00a9d8db352c` | `apps/espresso-escape` | **`com.jrod042.espressoescape`** | **`com.jrod042.espressoescape`** | `espressoescape` |
| Casa Rustico Go | `casa-rustico-go` | `@jrod42` / `25937717-3f2f-4793-af4d-79a12310f02a` | `apps/casa-rustico-go` | **`com.jrod042.casarusticogo`** | **`com.jrod042.casarusticogo`** | `casarusticogo` |

Apple team for both: `FY5H9V76QL`.

ASC Espresso Escape last known reject: version **1.0.2**, build **7** (2.1.0 completeness, 3.1.1 IAP). Source now ships **1.0.4** / build **9**, no IAP.

## Not in this repo

| Expo name | GitHub | slug | bundle / build |
|---|---|---|---|
| Casa Rustico (shop / HQ) | `JRod042/project-1` `mobile/` | `omni` | `com.jrod042.omni` / 49 |
| `casa-r-stico-go` | none | empty stray — ignore | — |

Historical scaffold only (never the live Expo slugs): `slug: casa-rustico`, bundle `com.casarustico.app`.

`gh repo list JRod042` has exactly two remotes: `Casa-Rustico` and `project-1`.
