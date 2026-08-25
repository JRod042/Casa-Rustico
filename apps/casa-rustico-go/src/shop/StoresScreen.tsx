import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { stores } from "../catalog";
import { colors, fonts } from "../theme";
import { Kicker, StoreTitle, ui } from "./ui";

export function StoresScreen() {
  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <StoreTitle title="Stores." sub="Pickup, the atelier, and bags that ship from the U.S." />
      {stores.map((store) => (
        <Pressable
          key={store.id}
          onPress={() =>
            Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(`${store.name}, ${store.address}`)}`)
          }
          style={({ pressed }) => [s.card, pressed && ui.pressed]}
        >
          <Image source={{ uri: store.image }} style={s.photo} resizeMode="cover" />
          <View style={s.copy}>
            <Kicker>{store.region}</Kicker>
            <Text style={s.name}>{store.name}</Text>
            <Text style={s.meta}>{store.address}</Text>
            <Text style={s.meta}>{store.hours}</Text>
            <Text style={s.amen}>{store.amenities.join(" · ")}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 96 },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.elevated,
    borderRadius: 16,
    overflow: "hidden",
  },
  photo: { width: "100%", height: 140, backgroundColor: colors.panel },
  copy: { padding: 16, gap: 4 },
  name: { color: colors.linen, fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.3 },
  meta: { color: colors.linenDim, fontFamily: fonts.sans, fontSize: 14 },
  amen: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.sans, fontSize: 13 },
});
