export type WelcomeSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export const escapeWelcomeSlides: WelcomeSlide[] = [
  {
    id: "brew",
    eyebrow: "Casual run",
    title: "Dodge the grinders",
    body: "Tap BREW to start a short coffee dash — keep your beans moving before the portafilter catches up.",
  },
  {
    id: "score",
    eyebrow: "Chase the roast",
    title: "Every dodge adds heat",
    body: "Score climbs while you stay in the flow. Bust out early and try a cleaner escape next round.",
  },
  {
    id: "house",
    eyebrow: "Casa Rústico",
    title: "Play now, sip later",
    body: "Espresso Escape is the game half of the house. When you are ready for bags and merch, open Casa Rústico Go.",
  },
];
