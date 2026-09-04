export type Tab = "home" | "order" | "scan" | "gift" | "stores";

export type Screen =
  | { kind: "tab"; tab: Tab }
  | { kind: "product"; productId: string; back: Screen }
  | { kind: "bag"; back: Screen }
  | { kind: "ritual"; back: Screen }
  | { kind: "story"; back: Screen }
  | { kind: "account"; back: Screen }
  | { kind: "join"; back: Screen };

export type ShopNav = {
  openProduct: (id: string) => void;
  openTab: (tab: Tab) => void;
  openBag: () => void;
  openAccount: () => void;
  openJoin: () => void;
  openStory: () => void;
  openRitual: () => void;
  goBack: () => void;
};

const TAB_LABEL: Record<Tab, string> = {
  home: "Home",
  order: "Order",
  scan: "Scan",
  gift: "Gift",
  stores: "Stores",
};

export function goBack(screen: Screen): Screen {
  return screen.kind === "tab" ? screen : screen.back;
}

export function activeTab(screen: Screen): Tab {
  let cur: Screen = screen;
  while (cur.kind !== "tab") cur = cur.back;
  return cur.tab;
}

export function backLabel(screen: Screen): string {
  if (screen.kind === "tab") return "Home";
  const prev = screen.back;
  if (prev.kind === "tab") return TAB_LABEL[prev.tab];
  if (prev.kind === "bag") return "Bag";
  if (prev.kind === "product") return "Coffee";
  if (prev.kind === "account") return "Account";
  return "Back";
}

export function isOnTab(screen: Screen, tab: Tab): boolean {
  return screen.kind === "tab" && screen.tab === tab;
}
