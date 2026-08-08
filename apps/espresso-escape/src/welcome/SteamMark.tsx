import { StyleSheet, View } from "react-native";
import { escapeWelcomeTheme as t } from "./theme";

/** Original cup + steam mark for Espresso Escape. */
export function SteamMark({ size = 84 }: { size?: number }) {
  const cupW = size * 0.78;
  const cupH = size * 0.55;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={styles.steamRow}>
        <View style={[styles.steam, { height: size * 0.22 }]} />
        <View style={[styles.steam, styles.steamMid, { height: size * 0.28 }]} />
        <View style={[styles.steam, { height: size * 0.2 }]} />
      </View>
      <View
        style={[
          styles.cup,
          {
            width: cupW,
            height: cupH,
            borderRadius: size * 0.12,
            borderColor: t.glow,
            backgroundColor: t.accent,
          },
        ]}
      />
      <View
        style={[
          styles.handle,
          {
            width: size * 0.22,
            height: size * 0.28,
            borderRadius: size * 0.14,
            borderColor: t.brand,
            right: size * 0.02,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "flex-end" },
  steamRow: {
    position: "absolute",
    top: 4,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  steam: {
    width: 4,
    borderRadius: 4,
    backgroundColor: t.brand,
    opacity: 0.7,
  },
  steamMid: { opacity: 0.95 },
  cup: { borderWidth: 2 },
  handle: {
    position: "absolute",
    bottom: 10,
    borderWidth: 3,
    backgroundColor: "transparent",
  },
});
