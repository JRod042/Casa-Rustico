import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { brand, colombia, formatPrice, gear } from "../catalog";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BrassButton, Kicker, StoreTitle, ui } from "./ui";

const TOTAL = 180;

const METHODS = [
  {
    name: "Pour-over",
    ratio: "1 : 16",
    grind: "Medium",
    time: "3:00",
    copy: "15 g coffee to 240 g water. Bloom 45 g for 30 seconds, then spiral to the line.",
  },
  {
    name: "Espresso",
    ratio: "1 : 2",
    grind: "Fine",
    time: "25–30 s",
    copy: "18 g in, 36 g out. Colombia espresso grind is already on the bag if you want it done.",
  },
  {
    name: "Mug",
    ratio: "House cup",
    grind: "As roasted",
    time: "Sit with it",
    copy: "The white glossy mug is the everyday house mark. Pair it with the week’s bag.",
  },
];

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function BrewTimer() {
  const [left, setLeft] = useState(TOTAL);
  const [on, setOn] = useState(false);
  const { flash } = useShop();

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      setLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [on]);

  useEffect(() => {
    if (left !== 0 || !on) return;
    setOn(false);
    flash("Pour is done.");
  }, [left, on, flash]);

  return (
    <View style={s.timer}>
      <Kicker>Pour-over</Kicker>
      <Text style={s.clock}>{formatClock(left)}</Text>
      <Text style={s.muted}>Bloom at 0:30. Finish at 3:00.</Text>
      <View style={s.timerRow}>
        <Pressable
          onPress={() => {
            if (left === 0) {
              setLeft(TOTAL);
              setOn(true);
              return;
            }
            setOn((v) => !v);
          }}
          style={({ pressed }) => [s.start, pressed && ui.pressed]}
        >
          <Text style={s.startText}>
            {on ? "Pause" : left === 0 ? "Start" : left < TOTAL ? "Resume" : "Start"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setOn(false);
            setLeft(TOTAL);
          }}
          style={s.reset}
        >
          <Text style={s.resetText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function RitualScreen({ openProduct }: { openProduct: (id: string) => void }) {
  const mug = gear()[0];

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <StoreTitle title="Ritual." sub="How we drink the house bag. Short methods, honest notes." />
      <Image source={{ uri: brand.ritualImage }} style={s.hero} resizeMode="cover" />
      <View style={s.block}>
        <Kicker>Colombia</Kicker>
        <Text style={s.h2}>Tasting notes.</Text>
        <Text style={s.body}>{colombia.notes}</Text>
        <Text style={s.muted}>{colombia.detail}</Text>
        <View style={{ marginTop: 20 }}>
          <BrassButton
            label={`Shop the bag · ${formatPrice(colombia.price)}`}
            onPress={() => openProduct(colombia.id)}
          />
        </View>
      </View>

      <BrewTimer />

      <View style={s.methods}>
        {METHODS.map((m) => (
          <View key={m.name} style={s.method}>
            <View style={s.methodHead}>
              <Text style={s.methodName}>{m.name}</Text>
              <Text style={s.ratio}>{m.ratio}</Text>
            </View>
            <Text style={s.muted}>
              {m.grind} · {m.time}
            </Text>
            <Text style={s.methodCopy}>{m.copy}</Text>
          </View>
        ))}
      </View>

      {mug ? (
        <Pressable
          onPress={() => openProduct(mug.id)}
          style={({ pressed }) => [s.mug, pressed && ui.pressed]}
        >
          <Image source={{ uri: mug.image }} style={s.mugImg} />
          <View>
            <Text style={s.name}>{mug.name}</Text>
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
  hero: { width: "100%", height: 224, backgroundColor: colors.elevated },
  block: { paddingHorizontal: 20, paddingTop: 24 },
  h2: {
    marginTop: 8,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  muted: {
    marginTop: 8,
    color: colors.linenMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  timer: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.elevated,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  clock: {
    marginTop: 12,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 56,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  timerRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  start: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.brass,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 14 },
  reset: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: { color: colors.linen, fontFamily: fonts.sansSemi, fontSize: 14 },
  methods: { paddingHorizontal: 20, marginTop: 8 },
  method: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  methodHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  methodName: { color: colors.linen, fontFamily: fonts.display, fontSize: 20 },
  ratio: { color: colors.brass, fontFamily: fonts.sans, fontSize: 14, fontVariant: ["tabular-nums"] },
  methodCopy: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  mug: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.elevated,
    borderRadius: 12,
    padding: 12,
  },
  mugImg: { width: 80, height: 80, borderRadius: 8 },
  name: { color: colors.linen, fontFamily: fonts.sansSemi, fontSize: 16 },
});
