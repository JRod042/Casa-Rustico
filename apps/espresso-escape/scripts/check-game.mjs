#!/usr/bin/env node
/** Pure-logic checks for the runner — no IAP, no store. */
function aabbHits(a, b, pad = 2) {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

const player = { x: 40, y: 200, w: 28, h: 36 };
const miss = { x: 120, y: 200, w: 44, h: 52 };
const hit = { x: 50, y: 210, w: 44, h: 52 };
if (aabbHits(player, miss)) throw new Error('false positive collision');
if (!aabbHits(player, hit)) throw new Error('missed collision');
if (aabbHits(player, { x: 40, y: 280, w: 20, h: 20 })) {
  throw new Error('ground bean should not collide with airborne player');
}
console.log('check-game: PASS');
