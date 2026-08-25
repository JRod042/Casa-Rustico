export type TierId = "welcome" | "cosecha" | "hacienda";

export type Reward = {
  id: string;
  beans: number;
  name: string;
  detail: string;
};

export type Tier = {
  id: TierId;
  name: string;
  minLifetime: number;
  perks: string[];
};

export const REWARDS: Reward[] = [
  { id: "r25", beans: 25, name: "Extra shot or house syrup", detail: "A customization, on us." },
  { id: "r50", beans: 50, name: "Hacienda drip or pastry", detail: "The weekday cup, or a mallorca." },
  { id: "r150", beans: 150, name: "Handcrafted drink", detail: "Cortado, con leche, cold brew." },
  { id: "r200", beans: 200, name: "Bakery and a drip", detail: "The morning pair." },
  { id: "r400", beans: 400, name: "House-mark merch", detail: "Mug or a bag of Colombia." },
];

export const TIERS: Tier[] = [
  {
    id: "welcome",
    name: "Welcome",
    minLifetime: 0,
    perks: ["Free to join", "Birthday drink", "Member offers"],
  },
  {
    id: "cosecha",
    name: "Cosecha",
    minLifetime: 100,
    perks: ["2× beans with Casa Card", "Free extra shot monthly", "Early drops"],
  },
  {
    id: "hacienda",
    name: "Hacienda",
    minLifetime: 300,
    perks: ["2× beans always", "A free drink each month", "First look at lots"],
  },
];

export function tierFor(lifetime: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (lifetime >= t.minLifetime) current = t;
  }
  return current;
}

export function nextReward(beans: number): { reward: Reward; need: number; pct: number } {
  const reward = REWARDS.find((r) => beans < r.beans) ?? REWARDS[REWARDS.length - 1];
  const prev = [...REWARDS].reverse().find((r) => r.beans <= beans);
  const floor = beans >= reward.beans ? 0 : (prev?.beans ?? 0);
  const span = Math.max(1, reward.beans - floor);
  const have = Math.min(beans, reward.beans) - floor;
  return {
    reward,
    need: Math.max(0, reward.beans - beans),
    pct: beans >= reward.beans ? 1 : Math.max(0, Math.min(1, have / span)),
  };
}

export function memberNumber(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h).toString().padStart(10, "0");
  return (`6081${n}0000`).slice(0, 16);
}

export function formatMember(no: string) {
  return no.replace(/(.{4})/g, "$1 ").trim();
}

export function beansForSpend(dollars: number, lifetime: number) {
  const rate = tierFor(lifetime).id === "welcome" ? 1 : 2;
  return Math.max(1, Math.round(dollars * rate));
}
