import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colombia, formatPrice, gear, getProduct } from "../catalog";
import { productUrl } from "../shopify";
import { useShop } from "../store";
import { colors, fonts } from "../theme";
import { BackRow, Chip, Kicker, ProductCard, Qty, ui } from "./ui";

export function ProductScreen({
  productId,
  onBack,
  backLabel,
  openProduct,
}: {
  productId: string;
  onBack: () => void;
  backLabel: string;
  openProduct: (id: string) => void;
}) {
  const product = getProduct(productId);
  const { addToCart, flash } = useShop();
  const variants = product?.variants ?? [];
  const [variantId, setVariantId] = useState(product?.defaultVariantId ?? 0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = variant?.price ?? product?.price ?? 0;

  if (!product) {
    return (
      <View style={s.missing}>
        <Text style={s.missingTitle}>Bag not found</Text>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={s.back}>Back to {backLabel}</Text>
        </Pressable>
      </View>
    );
  }

  const addToBag = () => {
    addToCart({
      productId: product.id,
      variantId: variant?.id ?? product.defaultVariantId,
      variantTitle: variant?.title ?? "12oz",
      price,
      qty,
    });
    setAdded(true);
    flash("Added to bag");
    setTimeout(() => setAdded(false), 1600);
  };

  const pair = product.id === "cr-mug" ? colombia : gear()[0];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
        <BackRow label={backLabel} onPress={onBack} />
        <Image source={{ uri: product.image }} style={s.hero} resizeMode="cover" />
        <View style={s.body}>
          {product.badge ? <Kicker>{product.badge}</Kicker> : null}
          <Text style={s.name}>{product.name}.</Text>
          <Text style={s.meta}>{[product.origin, product.roast].filter(Boolean).join(" · ")}</Text>
          <Text style={s.price}>{formatPrice(price)}</Text>
          {product.notes ? <Text style={s.notes}>{product.notes}</Text> : null}
          {product.detail ? <Text style={s.detail}>{product.detail}</Text> : null}
        </View>

        {variants.length > 1 ? (
          <View style={{ marginTop: 24 }}>
            <Text style={s.label}>Grind / size</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chips}
            >
              {variants.map((v) => (
                <Chip
                  key={v.id}
                  label={v.title}
                  on={v.id === variantId}
                  onPress={() => setVariantId(v.id)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={s.qtyBlock}>
          <Text style={s.label}>Quantity</Text>
          <Qty value={qty} onChange={setQty} min={1} />
        </View>

        {pair && pair.id !== product.id ? (
          <View style={s.pair}>
            <Kicker>Pair with</Kicker>
            <View style={{ width: 176, marginTop: 12 }}>
              <ProductCard product={pair} onPress={() => openProduct(pair.id)} />
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => Linking.openURL(productUrl(product.handle))}
          style={s.webLink}
        >
          <Text style={s.back}>View on rusticopr.com</Text>
        </Pressable>
      </ScrollView>

      <View style={s.dock}>
        <Text style={s.dockPrice}>{formatPrice(price * qty)}</Text>
        <Pressable onPress={addToBag} style={({ pressed }) => [s.add, pressed && ui.pressed]}>
          <Text style={s.addText}>{added ? "Added" : "Add to Bag"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 24 },
  missing: { paddingHorizontal: 20, paddingTop: 64, alignItems: "center" },
  missingTitle: { color: colors.linen, fontFamily: fonts.display, fontSize: 24, marginBottom: 12 },
  back: { color: colors.brassSoft, fontFamily: fonts.sansSemi, fontSize: 14 },
  hero: { width: "100%", aspectRatio: 1, backgroundColor: colors.elevated },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  name: {
    marginTop: 8,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  meta: { marginTop: 8, color: colors.linenMuted, fontFamily: fonts.sans, fontSize: 14 },
  price: {
    marginTop: 12,
    color: colors.linen,
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  notes: {
    marginTop: 16,
    color: colors.linenDim,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  detail: {
    marginTop: 12,
    color: colors.linenMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    paddingHorizontal: 20,
    color: colors.linenMuted,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  chips: { paddingHorizontal: 20 },
  qtyBlock: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pair: { marginTop: 40, paddingHorizontal: 20 },
  webLink: { marginTop: 32, paddingHorizontal: 20, minHeight: 44, justifyContent: "center" },
  dock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
    gap: 16,
  },
  dockPrice: {
    color: colors.linen,
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  add: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.linen,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 16 },
});
