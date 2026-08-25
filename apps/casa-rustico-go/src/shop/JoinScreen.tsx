import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TIERS } from "../rewards";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BrassButton, StoreTitle } from "./ui";

export function JoinScreen({ onDone }: { onDone: () => void }) {
  const { joinRewards, flash, member } = useShop();
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");

  const submit = () => {
    const n = name.trim();
    const e = email.trim();
    if (!e.includes("@")) {
      flash("Add a real email");
      return;
    }
    joinRewards(n || "Member", e);
    flash("Welcome to Hacienda Rewards");
    onDone();
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <StoreTitle title="Join." sub="Free. Beans on every bag. A birthday drink. Your Casa card in Scan." />
      <View style={s.form}>
        <Text style={s.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.linenMuted}
          autoCapitalize="words"
          style={s.input}
        />
        <Text style={s.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          placeholderTextColor={colors.linenMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={s.input}
        />
        <BrassButton label="Create my card" onPress={submit} />
      </View>
      {TIERS.map((t) => (
        <View key={t.id} style={s.tier}>
          <Text style={s.tierName}>{t.name}</Text>
          <Text style={s.tierBody}>{t.perks.join(" · ")}</Text>
        </View>
      ))}
      <Pressable onPress={onDone} hitSlop={8} style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <Text style={s.skip}>Not now</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 96 },
  form: { paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  label: { color: colors.linenMuted, fontFamily: fonts.sansSemi, fontSize: 13, marginTop: 8 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.elevated,
    paddingHorizontal: 16,
    color: colors.linen,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  tier: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.elevated,
    borderRadius: 14,
    padding: 16,
  },
  tierName: { color: colors.brass, fontFamily: fonts.display, fontSize: 20 },
  tierBody: { marginTop: 4, color: colors.linenDim, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  skip: { color: colors.linenMuted, fontFamily: fonts.sansSemi, fontSize: 14 },
});
