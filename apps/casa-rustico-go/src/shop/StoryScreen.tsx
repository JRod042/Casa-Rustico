import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { brand, colombia } from "../catalog";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BrassButton, Kicker, StoreTitle } from "./ui";

const REVIEWS = [
  {
    quote:
      "I could smell the coffee as soon as I picked up the package. Absolutely the best coffee I've had the pleasure of getting delivered.",
    name: "Christopher S. Santiago",
  },
  {
    quote:
      "Tiene un aroma intenso, un sabor penetrante y un color dominante — rasgos que me saben a hogar.",
    name: "Nicole S. Rincon",
  },
  {
    quote:
      "Coffee was delicious — multi-layered, complex, and wholesome. Could not recommend enough.",
    name: "Zechariah J. Randalls",
  },
];

export function StoryScreen({ openProduct }: { openProduct: (id: string) => void }) {
  const { replayWelcome } = useShop();

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <StoreTitle
        title="Story."
        sub="Puerto Rico in the mark. Single-origin in the cup. Colombia leads the menu."
      />

      {brand.landscapes.map((place) => (
        <View key={place.id} style={s.figure}>
          <Image source={{ uri: place.image }} style={s.photo} resizeMode="cover" />
          <View style={s.caption}>
            <Kicker>{place.kicker}</Kicker>
            <Text style={s.h2}>{place.title}.</Text>
            <Text style={s.body}>{place.copy}</Text>
          </View>
        </View>
      ))}

      <View style={s.block}>
        <Text style={s.h2}>The house mark.</Text>
        <Text style={s.body}>
          Rooted in coffee country. The look pulls from Puerto Rico’s highlands — mountain mornings,
          hacienda memory, the culture of the cup. We keep the menu short, the packaging clear, and
          the house mark on gear you actually use.
        </Text>
        <Text style={[s.body, { marginTop: 12 }]}>
          Kraft bags. A short origin list. No invented cafe. Bags, capsules, and ritual for the home
          bar — shipping from the U.S.
        </Text>
        <View style={{ marginTop: 20 }}>
          <BrassButton label="Start with Colombia" onPress={() => openProduct(colombia.id)} />
        </View>
      </View>

      <View style={s.block}>
        <Text style={s.h2}>From the house.</Text>
        {REVIEWS.map((r) => (
          <View key={r.name} style={s.review}>
            <Text style={s.quote}>“{r.quote}”</Text>
            <Text style={s.reviewer}>{r.name}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={replayWelcome} style={s.replay} accessibilityLabel="Replay intro">
        <Text style={s.replayText}>Replay intro</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 28 },
  figure: { marginBottom: 8 },
  photo: { width: "100%", height: 224, backgroundColor: colors.elevated },
  caption: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 4 },
  h2: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.3,
  },
  body: {
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  block: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  review: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  quote: {
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  reviewer: {
    marginTop: 8,
    color: colors.brass,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  replay: { paddingHorizontal: 20, paddingVertical: 20, minHeight: 44 },
  replayText: { color: colors.linenMuted, fontFamily: fonts.sansSemi, fontSize: 14 },
});
