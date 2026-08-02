import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark } from '../../src/components/BrandMark';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ProductCard } from '../../src/components/ProductCard';
import {
  fetchCollectionByHandle,
  isShopifyConfigured,
} from '../../src/shopify/client';
import type { Product } from '../../src/shopify/types';
import { colors, space } from '../../src/theme/tokens';

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isShopifyConfigured();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!configured) {
        setLoading(false);
        setError(
          'Add EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN to apps/mobile/.env to load the live catalog.',
        );
        return;
      }
      try {
        const collection =
          (await fetchCollectionByHandle('featured-collection', 6)) ??
          (await fetchCollectionByHandle('coffee', 6));
        if (mounted) setFeatured(collection?.products ?? []);
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
  }, [configured]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={['#2C2622', '#3D342C', '#5C4A3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroWash} />
        <BrandMark size="lg" light />
        <Text style={styles.heroBody}>
          A short menu of single-origin coffee under the Casa Rústico label.
          House-mark gear for the everyday ritual.
        </Text>
        <Link href="/shop" asChild>
          <PrimaryButton label="Shop the collection" variant="inverse" />
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <Text style={styles.sectionCopy}>
          Start with Costa Rica — or browse the short menu.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.espresso} style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {featured.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rooted in coffee country</Text>
        <Text style={styles.sectionCopy}>
          Our look pulls from Puerto Rico’s highlands — mountain mornings,
          hacienda memory, the culture of the cup. Coffee ships via our roasting
          partner; merch is Printful fulfilled. Both flow through Shopify.
        </Text>
        <Link href="/about" asChild>
          <Pressable>
            <Text style={styles.link}>About the brand →</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: space.xxl },
  hero: {
    minHeight: 420,
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
    justifyContent: 'flex-end',
    gap: space.md,
    overflow: 'hidden',
  },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroBody: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(247, 243, 236, 0.88)',
    maxWidth: 340,
  },
  section: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    gap: space.sm,
  },
  sectionTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: colors.espresso,
  },
  sectionCopy: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.md,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },
  errorBox: {
    marginTop: space.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.parchment,
  },
  errorText: {
    fontFamily: 'SourceSans3_400Regular',
    color: colors.ink,
    lineHeight: 22,
  },
  link: {
    marginTop: space.sm,
    fontFamily: 'SourceSans3_600SemiBold',
    color: colors.espresso,
    fontSize: 16,
  },
});
