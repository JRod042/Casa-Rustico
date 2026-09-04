import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatMember, nextReward, TIERS, tierFor } from "../rewards";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BackRow, BrassButton, StoreTitle } from "./ui";

export function AccountScreen({
  onJoin,
  onStory,
  onRitual,
  onBack,
  backLabel,
}: {
  onJoin: () => void;
  onStory: () => void;
  onRitual: () => void;
  onBack: () => void;
  backLabel: string;
}) {
  const { member, signOutMember, replayWelcome, flash } = useShop();

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <BackRow label={backLabel} onPress={onBack} />
      <StoreTitle
        title={member ? member.name : "Account."}
        sub={member ? formatMember(member.memberNo) : "Join Hacienda Rewards to keep beans on this phone."}
      />

      {member ? (
        <View style={s.block}>
          <Text style={s.h2}>{member.beans} beans</Text>
          <Text style={s.body}>
            {tierFor(member.lifetime).name} · {member.lifetime} lifetime · {nextReward(member.beans).reward.name}
          </Text>
          <Text style={s.meta}>{member.email}</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <BrassButton label="Join Hacienda Rewards" onPress={onJoin} />
        </View>
      )}

      {TIERS.map((t) => {
        const on = member ? tierFor(member.lifetime).id === t.id : false;
        return (
          <View key={t.id} style={[s.tier, on && s.tierOn]}>
            <Text style={s.tierName}>{t.name}</Text>
            <Text style={s.body}>{t.perks.join(" · ")}</Text>
          </View>
        );
      })}

      <Pressable onPress={onRitual} style={s.linkRow}>
        <Text style={s.link}>Ritual timer</Text>
      </Pressable>
      <Pressable onPress={onStory} style={s.linkRow}>
        <Text style={s.link}>House story</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          replayWelcome();
        }}
        style={s.linkRow}
      >
        <Text style={s.link}>Replay intro</Text>
      </Pressable>
      {member ? (
        <Pressable
          onPress={() => {
            signOutMember();
            flash("Signed out");
          }}
          style={s.linkRow}
        >
          <Text style={[s.link, { color: colors.linenMuted }]}>Sign out</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 96 },
  block: { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.elevated, borderRadius: 16, padding: 18 },
  h2: { color: colors.linen, fontFamily: fonts.display, fontSize: 28 },
  body: { marginTop: 6, color: colors.linenDim, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  meta: { marginTop: 8, color: colors.linenMuted, fontFamily: fonts.sans, fontSize: 13 },
  tier: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tierOn: { borderColor: colors.brass, backgroundColor: colors.elevated },
  tierName: { color: colors.brass, fontFamily: fonts.display, fontSize: 18 },
  linkRow: { paddingHorizontal: 20, paddingVertical: 14 },
  link: { color: colors.brass, fontFamily: fonts.sansSemi, fontSize: 16 },
});
