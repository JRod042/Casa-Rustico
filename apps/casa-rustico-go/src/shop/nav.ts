export type Tab = "home" | "coffee" | "ritual" | "story";

export type Screen =
  | { kind: "tab"; tab: Tab }
  | { kind: "product"; productId: string; back: Tab }
  | { kind: "bag"; back: Tab };

export function activeTab(screen: Screen): Tab {
  if (screen.kind === "tab") return screen.tab;
  return screen.back;
}
