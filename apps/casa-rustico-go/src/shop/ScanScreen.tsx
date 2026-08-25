import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatMember } from "../rewards";
import { firstName, useShop } from "../store";
import { colors, fonts } from "../theme";
import { BrassButton, StoreTitle } from "./ui";

function Barcode({ value }: { value: string }) {
  const bits: boolean[] = [];
  for (let i = 0; i < value.length; i++) {
    const n = value.charCodeAt(i);
    bits.push(true, (n & 1) === 1, (n & 2) === 2, false, (n & 4) === 4, true, false);
  }
  return (
    <View style={s.bars}>
      {bits.map((on, i) => (
        <View
          key={i}
          style={{
            width: on ? 2.2 : 1.1,
            height: on ? 72 : 56,
            backgroundColor: on ? colors.ink : "transparent",
            marginRight: 0.6,
          }}
        />
      ))}
    </View>
  );
}

export function ScanScreen({ onJoin }: { onJoin: () => void }) {
  const { member, flash } = useShop();

  if (!member) {
    return (
      <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
        <StoreTitle title="Scan." sub="Join Hacienda Rewards to pay and collect beans with your Casa card." />
        <View style={{ paddingHorizontal: 20 }}>
          <BrassButton label="Join Hacienda Rewards" onPress={onJoin} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <StoreTitle title="Scan." sub={`Show this at the counter, ${firstName(member.name)}.`} />
      <Pressable
        onPress={() => flash("Ready to scan")}
        style={s.wallet}
        accessibilityLabel="Membership card"
      >
        <Text style={s.walletKicker}>Casa Rústico</Text>
        <Text style={s.walletName}>{member.name}</Text>
        <View style={s.cardFace}>
          <Barcode value={member.memberNo} />
          <Text style={s.digits}>{formatMember(member.memberNo)}</Text>
        </View>
        <Text style={s.walletHint}>Cashier scans the bars. Beans land on this card.</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 96 },
  wallet: {
    marginHorizontal: 20,
    backgroundColor: colors.brass,
    borderRadius: 22,
    padding: 18,
    minHeight: 280,
  },
  walletKicker: {
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  walletName: {
    marginTop: 8,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  cardFace: {
    marginTop: 18,
    backgroundColor: colors.linen,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 72,
    overflow: "hidden",
    width: "100%",
  },
  digits: {
    marginTop: 10,
    color: colors.ink,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    letterSpacing: 1.6,
    fontVariant: ["tabular-nums"],
  },
  walletHint: {
    marginTop: 16,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 13,
    opacity: 0.7,
  },
});
