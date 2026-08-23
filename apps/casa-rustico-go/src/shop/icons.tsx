import { View } from "react-native";
import { colors } from "../theme";

function stroke(on: boolean) {
  return on ? colors.brass : colors.linenMuted;
}

export function IconHome({ on }: { on: boolean }) {
  const c = stroke(on);
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "flex-end" }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 9,
          borderRightWidth: 9,
          borderBottomWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: c,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: 14,
          height: 10,
          borderWidth: 1.7,
          borderTopWidth: 0,
          borderColor: c,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </View>
  );
}

export function IconCoffee({ on }: { on: boolean }) {
  const c = stroke(on);
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 12,
          height: 16,
          borderRadius: 6,
          borderWidth: 1.7,
          borderColor: c,
          transform: [{ rotate: "-18deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 1.6,
          height: 10,
          backgroundColor: c,
          borderRadius: 1,
          transform: [{ rotate: "-18deg" }],
        }}
      />
    </View>
  );
}

export function IconRitual({ on }: { on: boolean }) {
  const c = stroke(on);
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.7, borderColor: c }} />
      <View style={{ width: 1.7, height: 7, backgroundColor: c, marginTop: 1, borderRadius: 1 }} />
    </View>
  );
}

export function IconStory({ on }: { on: boolean }) {
  const c = stroke(on);
  return (
    <View
      style={{
        width: 16,
        height: 18,
        borderRadius: 3,
        borderWidth: 1.7,
        borderColor: c,
        justifyContent: "center",
        paddingHorizontal: 3,
        gap: 2.5,
      }}
    >
      <View style={{ height: 1.6, backgroundColor: c, borderRadius: 1 }} />
      <View style={{ height: 1.6, width: "70%", backgroundColor: c, borderRadius: 1 }} />
      <View style={{ height: 1.6, width: "85%", backgroundColor: c, borderRadius: 1 }} />
    </View>
  );
}

export function IconBag({ color = colors.linen, size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "flex-end" }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.62,
          borderWidth: 1.7,
          borderColor: color,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 1,
          width: size * 0.38,
          height: size * 0.28,
          borderWidth: 1.7,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      />
    </View>
  );
}
