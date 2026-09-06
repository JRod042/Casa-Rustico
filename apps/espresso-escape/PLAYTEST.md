# Espresso Escape — 10-minute phone playtest (1.0.6 / 13)

Device: iPhone. No Simulator in the build VM. Casa rebuilds the IPA after merge.

Brand lock: cream `#F7F3EC`, kraft `#A47C59`, dark kraft `#8D6C4F`. Highland café runner. Handmade paper / cardboard / sackcloth technique only — not a third-party toy reskin. No Sackboy IP.

**V2_HOLD:** Jorge skipped v1 review. Do not wire Creative first-pack PNGs. Target future denser v2. HOLD ASC Submit until Jorge says it feels pro.

**Render now:** RN Views + Images + Reanimated 2.5D + LinearGradient. Not Skia, not expo-gl / R3F.

## Before → after against the pillars

| Pillar | 1.0.5 / 12 (PR #18) | This PR (#21) |
|---|---|---|
| **Casa Rústico** | Dark espresso menus; View-box kits | Cream kraft stationery; in-repo Casa stickers (not Creative v1) |
| **LBP craft (technique)** | Flat stage | Scrapbook sheets (cardboard, stitch, paper edge, stamps). Living paper diorama |
| **Runner hits** | Coyote 100 / buffer 120; near-equal gravity; faint telegraph | Coyote **130ms**, buffer **150ms**, fall **3600 > 2200**, hurtbox **~63%**, telegraph **0.62s**, retry **320ms**, TAP→steam→bean, RAF 60fps cap |
| **Living-world awe** | Gradient + slats | 7-plate depth (canopy / far / highland / mid / shelf / mist / ground), steam, dust, plant sway, cloth, cups, soft shafts |
| **PRO** | View-box + custom AABB | Matter.js sensors + Reanimated 2.5D. Kit-eval may later pick GL / Skia / Rapier — **not this PR** |

PR #18 changed spawn fairness and packaging. Owner: that binary still “plays but nothing changed.” This pass is feel + menus + living depth + **hooks** for denser v2 — not a v1 art swap.

Cited playbook: `2026-09-05-escape-unified-revision-playbook` (ops file not always on this VM). Also `2026-09-05-escape-lbp-reviews-core-feel` and `2026-09-05-escape-lbp-craft-technique`.

**Feel QA lock:** squash hop (0.92 / 1.08) + fall **3600 > 2200** rise + land thump (1.32 / 0.62). Telegraph **0.62s ≥ 550ms**. ≥4 parallax plates (7 paper planes). Not a floaty toy jump.

Ranked: handmade warmth → wonder/inspection → tactile materials → soft danger → playful weight → charm → creativity-as-invitation → cozy craft → diorama depth → soft-chaos joy. Casa kraft only. No Sackboy IP. No Creative PNG wire.

## 10-minute checklist

Cold install (or Settings → Replay first brew):

- [ ] Welcome still reads Casa (not a toy mash-up). Start brewing is a kraft sticker with a stitch.
- [ ] First run skips the how-to wall and lands in Play.
- [ ] Coach: **Tap to hop** → hop → **Steam — stay low** → pass under → **Grab the honey bean**.
- [ ] After the script, first kits are grinders with ~2.3s of empty linen.

Feel (2–3 deaths + 1 long run):

- [ ] Late tap just after leaving the floor still hops (coyote).
- [ ] Tap slightly before landing still hops (buffer).
- [ ] Fall is snappier than the rise. Hold still floats for high beans.
- [ ] Paper edges can overlap a kit without a cheap roast.
- [ ] Honey beans ease toward the runner when close.
- [ ] Kits / floor marks warm ~0.6s before contact (**kraft**, not neon).
- [ ] Roast → one tap Brew again in under half a second. Next opener is easy (≥2s).
- [ ] Hop feels like cloth; landing is a cardboard thud; beans pop like fabric.
- [ ] Café has depth and idle life (planes, steam, dust, plants, cloth, cups).
- [ ] Hop / bean / roast / land fire haptics + SFX **after** the physics tick.

Menus:

- [ ] Title is cream scrapbook: dashed hero, Best run stamp, Play / How / Settings.
- [ ] How / About / Privacy / Settings sit on cardboard-backed paper sheets.
- [ ] Pause is cream paper. Resume is the sticker CTA.
- [ ] New high score titles **Best Run**. Instant retry still works by tapping anywhere.
- [ ] Settings: haptics, sound, Replay first brew, About, Privacy. No ads / IAP / accounts.

Art:

- [ ] Runner, kits, and beans read as coffee.
- [ ] Palette stays cream / kraft / dark kraft.
- [ ] No Creative v1 binaries swapped in. In-repo pack is a stand-in until v2 WIRE.

Out of scope: HomeKit, shop 49, vibecode ASC 6758108565, EAS Submit, expo-gl / Skia until kit-eval.
