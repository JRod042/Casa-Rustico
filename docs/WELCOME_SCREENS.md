# Welcome screens

## Study reference

https://github.com/Appllama/top-welcome-screens — slim clone at `references/top-welcome-screens/`.

## Chosen study: **Hallow**

Product welcomes follow the Hallow motion spec (`docs/MOTION_SPEC.md` in the reference):

- ~0.23–0.47s splash color interpolate
- dots appear ~1.23s; left→right pulse ~1.63–2.37s
- loader dissolves ~2.77–3.03s into the final brand surface
- interactions unlock after the dissolve

Branding, scene, and CTAs are original Casa Rústico — not Hallow (or any other) third-party identity. See upstream `NOTICE.md`.

## Product implementation

| App | Component | Storage key |
|-----|-----------|-------------|
| Casa Rustico Go | `CasaWelcome` | `@casa-rustico/go-welcome-v1` |
| Espresso Escape | `EscapeWelcome` | `@casa-rustico/escape-welcome-v1` |

Go: first launch shows `CasaWelcome`. Returning opens the shop. **Replay intro** on the Story tab clears the key.

Stack: Expo SDK 57, Reanimated timeline, LinearGradient atmosphere, Fraunces + Source Sans 3, AsyncStorage first-run gate.
