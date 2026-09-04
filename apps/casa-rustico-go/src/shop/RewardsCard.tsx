import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatMember, nextReward, tierFor } from "../rewards";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { ui } from "./ui";

export function RewardsCard({ onPress }: { onPress: () => void }) {
  const { member } = useShop();
  if (!member) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && ui.pressed]}>
        <Text style={s.kicker}>Hacienda Rewards</Text>
        <Text style={s.title}>Join to earn beans.</Text>
        <Text style={s.body}>A free birthday drink. Points on every bag. Scan in-store with your Casa card.</Text>
        <View style={s.cta}>
          <Text style={s.ctaText}>Join now</Text>
        </View>
      </Pressable>
    );
  }

  const tier = tierFor(member.lifetime);
  const { reward, need, pct } = nextReward(member.beans);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && ui.pressed]}>
      <View style={s.row}>
        <View style={s.ringWrap}>
          <View style={s.ringTrack} />
          <View style={[s.ringFill, { width: `${Math.round(pct * 100)}%` }]} />
          <View style={s.ringCenter}>
            <Text style={s.beans}>{member.beans}</Text>
            <Text style={s.beansLabel}>beans</Text>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.kicker}>
            Hacienda Rewards · {tier.name}
          </Text>
          <Text style={s.title}>
            {need === 0 ? "A reward is ready" : `${need} to ${reward.name.toLowerCase()}`}
          </Text>
          <Text style={s.body} numberOfLines={2}>
            {need === 0 ? `Redeem ${reward.name}.` : `Next: ${reward.name}.`}
          </Text>
          <Text style={s.member}>{formatMember(member.memberNo)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.kraft,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  kicker: {
    color: colors.brassSoft,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 6,
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 19,
  },
  cta: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: colors.kraft,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.sansBold, fontSize: 13 },
  ringWrap: { width: 76, height: 76, justifyContent: "center" },
  ringTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(245,234,216,0.18)",
  },
  ringFill: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.linen,
  },
  ringCenter: { alignItems: "center", justifyContent: "center", paddingBottom: 10 },
  beans: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
  },
  beansLabel: {
    color: colors.brassSoft,
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  member: {
    marginTop: 8,
    color: colors.linenMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    letterSpacing: 1.2,
  },
});
