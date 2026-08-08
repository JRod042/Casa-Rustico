export type WelcomeSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export const goWelcomeSlides: WelcomeSlide[] = [
  {
    id: "origins",
    eyebrow: "Single origin",
    title: "Beans with a clear story",
    body: "Browse roast-ready origins seeded from our house catalog — search by place, roast, and size.",
  },
  {
    id: "ship",
    eyebrow: "Ship ready",
    title: "From the house to your door",
    body: "Casa Rústico Go is the mobile path to the same specialty coffee and merch you find at rusticopr.com.",
  },
  {
    id: "escape",
    eyebrow: "Play + sip",
    title: "Earn the next bag",
    body: "Pair with Espresso Escape for a casual coffee run — then come back here when you are ready to reorder.",
  },
];
