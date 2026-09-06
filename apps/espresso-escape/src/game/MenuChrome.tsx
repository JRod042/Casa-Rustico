import { type ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { kraftSource } from "./kraftAssets";

/** Cream paper sheet — sticker chrome, Casa stationery. */
export function PaperSheet({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <View style={chrome.sheetWrap} testID={testID}>
      <Image
        source={kraftSource("menuPanel")}
        style={chrome.sheetArt}
        resizeMode="stretch"
      />
      <View style={chrome.stitch} />
      <View style={chrome.sheetInner}>{children}</View>
    </View>
  );
}

export function StickerButton({
  label,
  onPress,
  primary = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[chrome.sticker, primary ? chrome.stickerPrimary : chrome.stickerGhost]}
    >
      <Text style={primary ? chrome.stickerPrimaryText : chrome.stickerGhostText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PaperChip({ children }: { children: ReactNode }) {
  return (
    <View style={chrome.chip}>
      <Text style={chrome.chipText}>{children}</Text>
    </View>
  );
}

const chrome = StyleSheet.create({
  sheetWrap: {
    alignSelf: "stretch",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: t.kraftDeep,
    backgroundColor: t.cream,
    shadowColor: t.espresso,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sheetArt: {
    ...StyleSheet.absoluteFill,
    opacity: 0.55,
  },
  stitch: {
    ...StyleSheet.absoluteFill,
    margin: 8,
    borderWidth: 1,
    borderColor: t.kraftDeep,
    borderStyle: "dashed",
    borderRadius: 14,
    opacity: 0.45,
  },
  sheetInner: {
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 10,
  },
  sticker: {
    alignSelf: "stretch",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    transform: [{ rotate: "-0.4deg" }],
  },
  stickerPrimary: {
    backgroundColor: t.kraft,
    borderWidth: 2,
    borderColor: t.kraftDeep,
  },
  stickerGhost: {
    backgroundColor: t.cream,
    borderWidth: 2,
    borderColor: t.kraftDeep,
  },
  stickerPrimaryText: {
    color: t.stickerInk,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 17,
    fontWeight: "800",
  },
  stickerGhostText: {
    color: t.ink,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: t.cream,
    borderWidth: 1.5,
    borderColor: t.kraft,
  },
  chipText: {
    color: t.ink,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 16,
  },
});
