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

/** Scrapbook sheet: soft paper shadow, cardboard, cream face, stitch. Casa only. */
export function PaperSheet({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <View style={chrome.stack} testID={testID}>
      <View style={chrome.softShadow} />
      <View style={chrome.cardboard} />
      <View style={chrome.sheetWrap}>
        <Image
          source={kraftSource("menuPanel")}
          style={chrome.sheetArt}
          resizeMode="stretch"
        />
        <View style={chrome.paperEdge} />
        <View style={chrome.paperEdgeBottom} />
        <View style={chrome.stitch} />
        <View style={chrome.stitchInner} />
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

export function PaperChip({
  children,
  ink = false,
}: {
  children: ReactNode;
  ink?: boolean;
}) {
  return (
    <View style={[chrome.chip, ink && chrome.chipInk]}>
      <View style={[chrome.stampRing, ink && chrome.stampRingInk]} />
      <View style={chrome.stampRingInner} />
      <Text style={[chrome.chipText, ink && chrome.chipInkText]}>{children}</Text>
    </View>
  );
}

const chrome = StyleSheet.create({
  stack: {
    alignSelf: "stretch",
  },
  softShadow: {
    position: "absolute",
    left: 10,
    right: -10,
    top: 14,
    bottom: -12,
    backgroundColor: t.espresso,
    borderRadius: 18,
    opacity: 0.16,
    transform: [{ rotate: "1.4deg" }],
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
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: t.kraftDeep,
    backgroundColor: t.cream,
    transform: [{ rotate: "-0.5deg" }],
  },
  sheetArt: {
    ...StyleSheet.absoluteFill,
    opacity: 0.42,
  },
  paperEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 8,
    backgroundColor: t.kraft,
    opacity: 0.28,
  },
  paperEdgeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 5,
    backgroundColor: t.kraft,
    opacity: 0.18,
  },
  stitch: {
    ...StyleSheet.absoluteFill,
    margin: 7,
    borderWidth: 1,
    borderColor: t.kraftDeep,
    borderStyle: "dashed",
    borderRadius: 10,
    opacity: 0.55,
  },
  stitchInner: {
    ...StyleSheet.absoluteFill,
    margin: 11,
    borderWidth: 1,
    borderColor: t.kraft,
    borderStyle: "dashed",
    borderRadius: 8,
    opacity: 0.35,
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
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: t.cream,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    overflow: "hidden",
    transform: [{ rotate: "0.8deg" }],
  },
  chipInk: {
    backgroundColor: t.kraft,
    borderColor: t.kraftDeep,
    transform: [{ rotate: "-1.1deg" }],
  },
  stampRing: {
    ...StyleSheet.absoluteFill,
    margin: 3,
    borderWidth: 1,
    borderColor: t.kraft,
    borderStyle: "dashed",
    borderRadius: 4,
  },
  stampRingInk: {
    borderColor: "rgba(247,243,236,0.45)",
  },
  stampRingInner: {
    ...StyleSheet.absoluteFill,
    margin: 6,
    borderWidth: 1,
    borderColor: t.kraftDeep,
    borderStyle: "dashed",
    borderRadius: 3,
    opacity: 0.35,
  },
  chipText: {
    color: t.ink,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  chipInkText: {
    color: t.stickerInk,
    fontFamily: "SourceSans3_700Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
