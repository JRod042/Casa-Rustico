import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProductCard } from '../../src/components/ProductCard';
import {
  fetchCollectionByHandle,
  fetchProducts,
  isShopifyConfigured,
} from '../../src/shopify/client';
import type { Product } from '../../src/shopify/types';
import { colors, radii, space } from '../../src/theme/tokens';

type Filter = 'all' | 'coffee' | 'merch';

export default function ShopScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isShopifyConfigured()) {
        setLoading(false);
        setError('Storefront token missing — see apps/mobile/.env.example');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let next: Product[] = [];
        if (filter === 'all') {
          next = await fetchProducts(50);
        } else {
          const collection = await fetchCollectionByHandle(filter, 50);
          next = collection?.products ?? [];
        }
        if (mounted) setProducts(next);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load shop');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const filters = useMemo(
    () =>
      [
        { id: 'all' as const, label: 'All' },
        { id: 'coffee' as const, label: 'Coffee' },
        { id: 'merch' as const, label: 'Merch' },
      ] as const,
    [],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lede}>
        Short menu. Clear origins. House-mark gear.
      </Text>

      <View style={styles.filters}>
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.espresso} style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: {
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
  },
  lede: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    color: colors.muted,
  },
  filters: { flexDirection: 'row', gap: space.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.parchment,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  chipActive: {
    backgroundColor: colors.espresso,
    borderColor: colors.espresso,
  },
  chipText: {
    fontFamily: 'SourceSans3_600SemiBold',
    color: colors.espresso,
    fontSize: 14,
  },
  chipTextActive: { color: colors.onDark },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.sm,
  },
  gridItem: { width: '47%', flexGrow: 1 },
  error: {
    fontFamily: 'SourceSans3_400Regular',
    color: colors.terracotta,
    marginTop: space.md,
    lineHeight: 22,
  },
});
