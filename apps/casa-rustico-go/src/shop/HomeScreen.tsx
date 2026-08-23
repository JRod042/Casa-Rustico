import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, colombia, formatPrice, gear, origins } from "../catalog";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BrassButton, Kicker, ProductCard, StoreTitle, ui } from "./ui";
import type { Tab } from "./nav";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

export function HomeScreen({
  openProduct,
  openTab,
}: {
  openProduct: (id: string) => void;
  openTab: (tab: Tab) => void;
}) {
  const featured = origins().filter((p) => p.id !== "cr-colombia");
  const mug = gear()[0];
  const { flash } = useShop();

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <StoreTitle title={greeting()} sub="Colombia leads. Single-origin. Ship ready from the U.S." />

      <View style={s.hero}>
        <Image source={{ uri: brand.heroImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(18,14,11,0.12)", "rgba(18,14,11,0.5)", colors.bg]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.heroCopy}>
          <Kicker>Colombia</Kicker>
          <Text style={s.heroTitle}>The house bag.</Text>
          <Text style={s.heroBody}>
            {colombia.notes}. {brand.promo} · {brand.promoCopy.toLowerCase()}.
          </Text>
          <BrassButton label={`Buy · ${formatPrice(colombia.price)}`} onPress={() => openProduct(colombia.id)} />
        </View>
      </View>

      <Pressable
        onPress={() => flash(`${brand.promo} · ${brand.promoCopy}`)}
        style={({ pressed }) => [s.promo, pressed && ui.pressed]}
      >
        <Kicker>First bag</Kicker>
        <Text style={s.promoCode}>{brand.promo}</Text>
        <Text style={s.promoCopy}>{brand.promoCopy}. Tap to remember.</Text>
      </Pressable>

      <View style={s.sectionHead}>
        <View>
          <Text style={s.h2}>The latest.</Text>
          <Text style={s.muted}>Origins, one bag at a time</Text>
        </View>
        <Pressable onPress={() => openTab("coffee")} hitSlop={8}>
          <Text style={s.link}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.rail}
      >
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} large onPress={() => openProduct(p.id)} />
        ))}
      </ScrollView>

      <View style={[s.sectionHead, { marginTop: 28 }]}>
        <View>
          <Text style={s.h2}>From the highlands.</Text>
          <Text style={s.muted}>The look of the house</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.rail}
      >
        {brand.landscapes.map((place) => (
          <Pressable
            key={place.id}
            onPress={() => openTab("story")}
            style={({ pressed }) => [s.place, pressed && ui.pressed]}
          >
            <Image source={{ uri: place.image }} style={s.placeImg} resizeMode="cover" />
            <LinearGradient
              colors={["transparent", "rgba(18,14,11,0.85)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.placeCopy}>
              <Kicker>{place.kicker}</Kicker>
              <Text style={s.placeTitle}>{place.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {mug ? (
        <Pressable
          onPress={() => openProduct(mug.id)}
          style={({ pressed }) => [s.mug, pressed && ui.pressed]}
        >
          <Image source={{ uri: mug.image }} style={s.mugImg} resizeMode="cover" />
          <View style={s.mugCopy}>
            <Kicker>Accessories</Kicker>
            <Text style={s.h2}>The house mug.</Text>
            <Text style={s.muted}>
              {mug.subtitle} · {formatPrice(mug.price)}
            </Text>
          </View>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 28 },
  hero: { minHeight: 380, justifyContent: "flex-end" },
  heroCopy: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 96, gap: 10 },
  heroTitle: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.5,
    maxWidth: 280,
  },
  heroBody: {
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 4,
  },
  promo: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.elevated,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  promoCode: {
    marginTop: 8,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 28,
  },
  promoCopy: {
    marginTop: 4,
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  sectionHead: {
    marginTop: 36,
    marginBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  h2: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.3,
  },
  muted: {
    marginTop: 4,
    color: colors.linenMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  link: { color: colors.brass, fontFamily: fonts.sansSemi, fontSize: 14, paddingBottom: 2 },
  rail: { paddingHorizontal: 20, paddingRight: 8 },
  place: {
    width: 240,
    height: 176,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  placeImg: { ...StyleSheet.absoluteFillObject },
  placeCopy: { position: "absolute", left: 14, right: 14, bottom: 14, gap: 2 },
  placeTitle: { color: colors.linen, fontFamily: fonts.display, fontSize: 20 },
  mug: {
    marginHorizontal: 20,
    marginTop: 36,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.elevated,
  },
  mugImg: { width: "100%", height: 220 },
  mugCopy: { paddingHorizontal: 20, paddingVertical: 20, gap: 6 },
});
