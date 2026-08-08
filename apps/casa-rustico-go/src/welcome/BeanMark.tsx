import { StyleSheet, View } from "react-native";
import { goWelcomeTheme as t } from "./theme";

/** Original geometric bean mark — not from third-party welcome kits. */
export function BeanMark({ size = 72 }: { size?: number }) {
  const w = size;
  const h = size * 1.15;
  return (
    <View style={[styles.wrap, { width: w, height: h }]}>
      <View
        style={[
          styles.bean,
          {
            width: w * 0.72,
            height: h * 0.88,
            borderRadius: w * 0.36,
            backgroundColor: t.accentSoft,
          },
        ]}
      />
      <View
        style={[
          styles.crease,
          {
            width: 2,
            height: h * 0.55,
            borderRadius: 2,
            backgroundColor: t.glow,
            opacity: 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.halo,
          {
            width: w,
            height: h,
            borderRadius: w / 2,
            borderColor: t.brand,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  bean: { position: "absolute" },
  crease: { position: "absolute", transform: [{ rotate: "-12deg" }] },
  halo: {
    position: "absolute",
    borderWidth: 1.5,
    opacity: 0.35,
  },
});
