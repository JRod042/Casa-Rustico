import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../src/cart/CartProvider';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import {
  fetchProductByHandle,
  formatMoney,
  isShopifyConfigured,
} from '../../src/shopify/client';
import type { Product, ProductVariant } from '../../src/shopify/types';
import { colors, radii, space } from '../../src/theme/tokens';

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const router = useRouter();
  const { addVariant, busy } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!handle || !isShopifyConfigured()) {
        setLoading(false);
        setError('Product unavailable — configure Storefront API token.');
        return;
      }
      try {
        const next = await fetchProductByHandle(handle);
        if (!mounted) return;
        setProduct(next);
        const firstAvailable =
          next?.variants.find((v) => v.availableForSale) ??
          next?.variants[0] ??
          null;
        setVariant(firstAvailable);
        if (!next) setError('Product not found');
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [handle]);

  const optionNames = useMemo(() => {
    if (!product) return [] as string[];
    const names = new Set<string>();
    product.variants.forEach((v) =>
      v.selectedOptions.forEach((o) => names.add(o.name)),
    );
    return Array.from(names);
  }, [product]);

  const selectedMap = useMemo(() => {
    const map: Record<string, string> = {};
    variant?.selectedOptions.forEach((o) => {
      map[o.name] = o.value;
    });
    return map;
  }, [variant]);

  const valuesFor = (name: string) => {
    if (!product) return [] as string[];
    return Array.from(
      new Set(
        product.variants
          .map((v) => v.selectedOptions.find((o) => o.name === name)?.value)
          .filter(Boolean) as string[],
      ),
    );
  };

  const selectOption = (name: string, value: string) => {
    if (!product) return;
    const nextMap = { ...selectedMap, [name]: value };
    const match =
      product.variants.find((v) =>
        v.selectedOptions.every((o) => nextMap[o.name] === o.value),
      ) ?? null;
    setVariant(match);
    setAdded(false);
  };

  const onAdd = async () => {
    if (!variant?.availableForSale) return;
    try {
      await addVariant(variant.id, 1);
      setAdded(true);
    } catch {
      // error surfaced via cart context
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.espresso} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Not found'}</Text>
      </View>
    );
  }

  const imageUrl = variant?.image?.url ?? product.featuredImage?.url;

  return (
    <>
      <Stack.Screen options={{ title: product.title }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.imageFallback]} />
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>
            {variant
              ? formatMoney(variant.price)
              : formatMoney(product.priceRange.minVariantPrice)}
          </Text>

          {optionNames.map((name) => (
            <View key={name} style={styles.optionBlock}>
              <Text style={styles.optionLabel}>{name}</Text>
              <View style={styles.optionRow}>
                {valuesFor(name).map((value) => {
                  const active = selectedMap[name] === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => selectOption(name, value)}
                      style={[styles.optionChip, active && styles.optionActive]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          <PrimaryButton
            label={
              !variant?.availableForSale
                ? 'Sold out'
                : added
                  ? 'Added to cart'
                  : 'Add to cart'
            }
            onPress={onAdd}
            loading={busy}
            disabled={!variant?.availableForSale}
          />

          {added ? (
            <PrimaryButton
              label="View cart"
              variant="ghost"
              onPress={() => router.push('/cart')}
              style={{ marginTop: space.sm }}
            />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: space.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    padding: space.lg,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.creamAlt,
  },
  imageFallback: { borderBottomWidth: 1, borderColor: colors.border },
  body: {
    padding: space.lg,
    gap: space.md,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: colors.espresso,
  },
  price: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 18,
    color: colors.ink,
  },
  optionBlock: { gap: space.sm },
  optionLabel: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 14,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  optionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.parchment,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  optionActive: {
    backgroundColor: colors.espresso,
    borderColor: colors.espresso,
  },
  optionText: {
    fontFamily: 'SourceSans3_600SemiBold',
    color: colors.espresso,
    fontSize: 14,
  },
  optionTextActive: { color: colors.onDark },
  description: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  error: {
    fontFamily: 'SourceSans3_400Regular',
    color: colors.terracotta,
    textAlign: 'center',
  },
});
