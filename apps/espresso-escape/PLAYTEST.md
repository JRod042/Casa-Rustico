# Espresso Escape — 10-minute phone playtest (1.0.6 / 13)

Device: iPhone. No Simulator in the build VM. Casa rebuilds the IPA after merge.

Brand lock: cream `#F7F3EC`, kraft `#A47C59`, dark kraft `#8D6C4F`. Highland café runner. Handmade paper / cardboard / sackcloth technique only — not a third-party toy reskin.

## Before → after (honest)

| Surface | 1.0.5 / 12 (PR #18) | This build |
|---|---|---|
| Loop art | View-box ovals and kit rectangles | Casa kraft PNG stickers (runner, grinder, portafilter, steam, bean) on cream paper |
| Stage | Gradient + slats | Living 2.5D café: far/mid/near/ground, steam, dust, idle props, soft light |
| Jump feel | Coyote 100ms, buffer 120ms, near-equal gravity | Coyote **130ms**, buffer **150ms**, fall **3600 > 2200** rise |
| Hurtbox | ~74% tall | **~63%** of the sticker |
| Magnet / telegraph | Missing / faint floor tick | Bean pull + **0.62s** kraft glow warn |
| First run | “Tap to hop” only | **TAP → steam → honey bean** then the normal line |
| Death → retry | 380ms, dark “Roasted” sheet | **320ms**, cream sticker, **Best Run** + instant Brew again |
| Menus | Dark espresso stack | Cream stationery: title, how-to, **Settings**, pause, Best Run |

PR #18 changed spawn fairness and packaging. Owner: that binary still “plays but nothing changed.” This pass is art + feel + menus, not another version stamp.

**Render:** 2.5D paper planes (not R3F). Full 3D would fight mid-iPhone 60fps — see `STACK.md`.
**Physics:** Matter.js sensor queries + custom variable-gravity hop (coyote/buffer/telegraph on top).
**Creative pack:** HALTED until Jorge says WIRE. Hooks only (`npm run sync:kraft` is a no-op without `ESCAPE_WIRE_KRAFT=1`).
**HOLD ASC Submit** until owner ok.

## 10-minute checklist

Cold install (or Settings → Replay first brew):

- [ ] Welcome still reads Casa (not a toy mash-up). Start brewing is a kraft sticker.
- [ ] First run skips the how-to wall and lands in Play.
- [ ] Coach: **Tap to hop** → hop → **Steam — stay low** → pass under → **Grab the honey bean**.
- [ ] After the script, first kits are grinders with ~2.3s of empty linen.

Feel (2–3 deaths + 1 long run):

- [ ] Late tap just after leaving the floor still hops (coyote).
- [ ] Tap slightly before landing still hops (buffer).
- [ ] Fall is snappier than the rise. Hold still floats for high beans.
- [ ] Paper edges can overlap a kit without a cheap roast.
- [ ] Honey beans ease toward the runner when close.
- [ ] Kits glow / floor mark brightens ~0.6s before contact.
- [ ] Roast → one tap Brew again in under half a second. Next opener is easy (≥2s).
- [ ] Hop feels like cloth; landing is a cardboard thud; beans pop like fabric — not neon arcade.
- [ ] Café backdrop has depth (planes, steam, dust, idle sacks). Not a flat wallpaper.
- [ ] Hop / bean / roast / land fire haptics + SFX **after** the physics tick (no double hop buzz).

Menus:

- [ ] Title is cream with Casa wordmark, Best run chip, Play / How to play / Settings.
- [ ] Pause sheet is cream paper, Resume is the sticker CTA.
- [ ] New high score titles **Best Run**. Instant retry still works by tapping anywhere.
- [ ] Settings: haptics, sound, Replay first brew, About, Privacy. No ads / IAP / accounts.

Art:

- [ ] Runner, kits, and beans read as coffee, not gray boxes.
- [ ] Palette stays cream / kraft / dark kraft. No rainbow toy colors.

Out of scope this pass: HomeKit, shop 49, vibecode ASC 6758108565.
