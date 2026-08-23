import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { cartCount, useShop } from "../store";
import { colors, fonts } from "../theme";
import { IconBag, IconCoffee, IconHome, IconRitual, IconStory } from "./icons";
import { HomeScreen } from "./HomeScreen";
import { CoffeeScreen } from "./CoffeeScreen";
import { ProductScreen } from "./ProductScreen";
import { BagScreen } from "./BagScreen";
import { RitualScreen } from "./RitualScreen";
import { StoryScreen } from "./StoryScreen";
import { activeTab, type Screen, type Tab } from "./nav";
import { ui } from "./ui";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "coffee", label: "Coffee" },
  { id: "ritual", label: "Ritual" },
  { id: "story", label: "Story" },
];

function TabGlyph({ id, on }: { id: Tab; on: boolean }) {
  if (id === "home") return <IconHome on={on} />;
  if (id === "coffee") return <IconCoffee on={on} />;
  if (id === "ritual") return <IconRitual on={on} />;
  return <IconStory on={on} />;
}

export function ShopShell() {
  const { cart, toast } = useShop();
  const count = cartCount(cart);
  const [screen, setScreen] = useState<Screen>({ kind: "tab", tab: "home" });
  const [pop, setPop] = useState(false);
  const lastCount = useRef(count);
  const tab = activeTab(screen);
  const onBag = screen.kind === "bag";

  useEffect(() => {
    if (count > lastCount.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 420);
      lastCount.current = count;
      return () => clearTimeout(id);
    }
    lastCount.current = count;
  }, [count]);

  const openProduct = (productId: string) => {
    setScreen({ kind: "product", productId, back: tab });
  };
  const openTab = (next: Tab) => setScreen({ kind: "tab", tab: next });
  const openBag = () => setScreen({ kind: "bag", back: tab });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <View style={s.frame}>
        {!onBag ? (
          <Pressable
            onPress={openBag}
            accessibilityRole="button"
            accessibilityLabel={`Bag, ${count} items`}
            style={({ pressed }) => [s.fab, pop && s.fabPop, pressed && ui.pressed]}
          >
            <IconBag />
            {count > 0 ? (
              <View style={s.badge}>
                <Text style={s.badgeText}>{count > 9 ? "9+" : count}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}

        {toast ? (
          <View pointerEvents="none" style={s.toast}>
            <Text style={s.toastText}>{toast}</Text>
          </View>
        ) : null}

        <View style={s.main}>
          {screen.kind === "product" ? (
            <ProductScreen
              key={screen.productId}
              productId={screen.productId}
              onBack={() => openTab("coffee")}
              openProduct={openProduct}
            />
          ) : screen.kind === "bag" ? (
            <BagScreen openProduct={openProduct} />
          ) : tab === "home" ? (
            <HomeScreen openProduct={openProduct} openTab={openTab} />
          ) : tab === "coffee" ? (
            <CoffeeScreen openProduct={openProduct} />
          ) : tab === "ritual" ? (
            <RitualScreen openProduct={openProduct} />
          ) : (
            <StoryScreen openProduct={openProduct} />
          )}
        </View>

        <View style={s.dock} accessibilityRole="tablist">
          {TABS.map((item) => {
            const on = tab === item.id && screen.kind === "tab";
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => openTab(item.id)}
                style={s.tab}
              >
                <TabGlyph id={item.id} on={on} />
                <Text style={[s.tabLabel, on && s.tabLabelOn]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  frame: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center" },
  main: { flex: 1 },
  fab: {
    position: "absolute",
    right: 16,
    top: 4,
    zIndex: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPop: { transform: [{ scale: 1.08 }] },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.brass,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 84,
    zIndex: 30,
    backgroundColor: colors.linen,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  toastText: { color: colors.ink, fontFamily: fonts.sansSemi, fontSize: 14 },
  dock: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 52, gap: 4 },
  tabLabel: {
    color: colors.linenMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  tabLabelOn: { color: colors.brass },
});
