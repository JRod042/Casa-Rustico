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

/** Scrapbook sheet: cardboard back, cream face, stitch, paper edge. Casa only. */
export function PaperSheet({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <View style={chrome.stack} testID={testID}>
      <View style={chrome.cardboard} />
      <View style={chrome.sheetWrap}>
        <Image
          source={kraftSource("menuPanel")}
          style={chrome.sheetArt}
          resizeMode="stretch"
        />
        <View style={chrome.paperEdge} />
        <View style={chrome.stitch} />
        <View style={chrome.sheetInner}>{children}</View>
      </View>
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
      <View style={chrome.stickerStitch} />
      <Text style={primary ? chrome.stickerPrimaryText : chrome.stickerGhostText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PaperChip({ children }: { children: ReactNode }) {
  return (
    <View style={chrome.chip}>
      <View style={chrome.stampRing} />
      <Text style={chrome.chipText}>{children}</Text>
    </View>
  );
}

const chrome = StyleSheet.create({
  stack: {
    alignSelf: "stretch",
  },
  cardboard: {
    position: "absolute",
    left: 6,
    right: -4,
    top: 8,
    bottom: -5,
    backgroundColor: t.kraftDeep,
    borderRadius: 16,
    transform: [{ rotate: "1.1deg" }],
    opacity: 0.88,
  },
  sheetWrap: {
    alignSelf: "stretch",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: t.kraft,
    backgroundColor: t.cream,
    transform: [{ rotate: "-0.5deg" }],
  },
  sheetArt: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
  },
  paperEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 7,
    backgroundColor: t.kraft,
    opacity: 0.22,
  },
  stitch: {
    ...StyleSheet.absoluteFill,
    margin: 7,
    borderWidth: 1,
    borderColor: t.kraftDeep,
    borderStyle: "dashed",
    borderRadius: 12,
    opacity: 0.5,
  },
  sheetInner: {
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 10,
  },
  sticker: {
    alignSelf: "stretch",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    overflow: "hidden",
    transform: [{ rotate: "-0.5deg" }],
  },
  stickerStitch: {
    ...StyleSheet.absoluteFill,
    margin: 5,
    borderWidth: 1,
    borderColor: "rgba(42,24,16,0.28)",
    borderStyle: "dashed",
    borderRadius: 8,
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
    borderRadius: 8,
    backgroundColor: t.cream,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    transform: [{ rotate: "0.8deg" }],
  },
  stampRing: {
    ...StyleSheet.absoluteFill,
    margin: 3,
    borderWidth: 1,
    borderColor: t.kraft,
    borderStyle: "dashed",
    borderRadius: 6,
  },
  chipText: {
    color: t.ink,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 16,
  },
});
