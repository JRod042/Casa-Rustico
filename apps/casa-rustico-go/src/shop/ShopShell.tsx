import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { brand, colombia } from "../catalog";
import { cartCount, useShop } from "../store";
import { colors, fonts } from "../theme";
import { IconBag, IconCoffee, IconGift, IconHome, IconPin, IconScan } from "./icons";
import { HomeScreen } from "./HomeScreen";
import { CoffeeScreen } from "./CoffeeScreen";
import { ProductScreen } from "./ProductScreen";
import { BagScreen } from "./BagScreen";
import { RitualScreen } from "./RitualScreen";
import { StoryScreen } from "./StoryScreen";
import { ScanScreen } from "./ScanScreen";
import { GiftScreen } from "./GiftScreen";
import { StoresScreen } from "./StoresScreen";
import { AccountScreen } from "./AccountScreen";
import { JoinScreen } from "./JoinScreen";
import { activeTab, backLabel, goBack, isOnTab, type Screen, type Tab } from "./nav";
import { ui } from "./ui";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "order", label: "Order" },
  { id: "scan", label: "Scan" },
  { id: "gift", label: "Gift" },
  { id: "stores", label: "Stores" },
];

function TabGlyph({ id, on }: { id: Tab; on: boolean }) {
  if (id === "home") return <IconHome on={on} />;
  if (id === "order") return <IconCoffee on={on} />;
  if (id === "scan") return <IconScan on={on} />;
  if (id === "gift") return <IconGift on={on} />;
  return <IconPin on={on} />;
}

export function ShopShell() {
  const { cart, toast, member } = useShop();
  const count = cartCount(cart);
  const [screen, setScreen] = useState<Screen>({ kind: "tab", tab: "home" });
  const [pop, setPop] = useState(false);
  const lastCount = useRef(count);
  const tab = activeTab(screen);
  const onBag = screen.kind === "bag";
  const hideDock = screen.kind === "join";

  useEffect(() => {
    Image.prefetch(brand.heroImage).catch(() => undefined);
    Image.prefetch(colombia.image).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (count > lastCount.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 420);
      lastCount.current = count;
      return () => clearTimeout(id);
    }
    lastCount.current = count;
  }, [count]);

  const openProduct = useCallback((productId: string) => {
    setScreen((s) => ({ kind: "product", productId, back: s }));
  }, []);
  const openTab = useCallback((next: Tab) => setScreen({ kind: "tab", tab: next }), []);
  const openBag = useCallback(() => {
    setScreen((s) => (s.kind === "bag" ? s : { kind: "bag", back: s }));
  }, []);
  const openAccount = useCallback(() => {
    setScreen((s) => ({ kind: "account", back: s }));
  }, []);
  const openJoin = useCallback(() => {
    setScreen((s) => ({ kind: "join", back: s }));
  }, []);
  const openStory = useCallback(() => {
    setScreen((s) => ({ kind: "story", back: s }));
  }, []);
  const openRitual = useCallback(() => {
    setScreen((s) => ({ kind: "ritual", back: s }));
  }, []);
  const onBack = useCallback(() => setScreen((s) => goBack(s)), []);

  const onJoinDone = useCallback((joined: boolean) => {
    setScreen((s) => {
      const prev = goBack(s);
      if (!joined) return prev;
      if (prev.kind === "tab" && prev.tab === "gift") return prev;
      return { kind: "tab", tab: "scan" };
    });
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <View style={s.frame}>
        {!onBag && screen.kind !== "join" ? (
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
              backLabel={backLabel(screen)}
              onBack={onBack}
              openProduct={openProduct}
            />
          ) : screen.kind === "bag" ? (
            <BagScreen backLabel={backLabel(screen)} onBack={onBack} openProduct={openProduct} />
          ) : screen.kind === "ritual" ? (
            <RitualScreen backLabel={backLabel(screen)} onBack={onBack} openProduct={openProduct} />
          ) : screen.kind === "story" ? (
            <StoryScreen backLabel={backLabel(screen)} onBack={onBack} openProduct={openProduct} />
          ) : screen.kind === "account" ? (
            <AccountScreen
              backLabel={backLabel(screen)}
              onBack={onBack}
              onJoin={openJoin}
              onStory={openStory}
              onRitual={openRitual}
            />
          ) : screen.kind === "join" ? (
            <JoinScreen onDone={onJoinDone} />
          ) : tab === "home" ? (
            <HomeScreen
              openProduct={openProduct}
              openTab={openTab}
              openAccount={member ? openAccount : openJoin}
              openStory={openStory}
              openRitual={openRitual}
            />
          ) : tab === "order" ? (
            <CoffeeScreen openProduct={openProduct} />
          ) : tab === "scan" ? (
            <ScanScreen onJoin={openJoin} />
          ) : tab === "gift" ? (
            <GiftScreen onJoin={openJoin} />
          ) : (
            <StoresScreen />
          )}
        </View>

        {hideDock ? null : (
          <View style={s.dock} accessibilityRole="tablist">
            {TABS.map((item) => {
              const on = isOnTab(screen, item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="tab"
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
        )}
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
    backgroundColor: colors.kraft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.linen,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 96,
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
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 32,
    backgroundColor: "rgba(38,30,22,0.94)",
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 52, gap: 4 },
  tabLabel: {
    color: colors.linenMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  tabLabelOn: { color: colors.brassSoft },
});
