import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { formatMoney } from '../shopify/client';
import type { Product } from '../shopify/types';
import { colors, radii, space } from '../theme/tokens';

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const available = product.variants.some((v) => v.availableForSale);

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable style={styles.card}>
        {product.featuredImage?.url ? (
          <Image
            source={{ uri: product.featuredImage.url }}
            style={styles.image}
            accessibilityLabel={product.featuredImage.altText ?? product.title}
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title.replace(/^Casa Rústico\s*[—-]\s*/i, '')}
          </Text>
          <Text style={styles.price}>
            {available
              ? `from ${formatMoney(product.priceRange.minVariantPrice)}`
              : 'Sold out'}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: space.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: colors.creamAlt,
    borderRadius: radii.sm,
  },
  imageFallback: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  meta: { gap: 4 },
  title: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 15,
    color: colors.ink,
  },
  price: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
});
