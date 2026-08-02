import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useCart } from '../../src/cart/CartProvider';
import { useCheckout } from '../../src/checkout/useCheckout';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { formatMoney } from '../../src/shopify/client';
import { colors, radii, space } from '../../src/theme/tokens';

export default function CartScreen() {
  const { cart, loading, busy, error, setLineQuantity, removeLine } = useCart();
  const { present } = useCheckout();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.espresso} />
      </View>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyCopy}>
          Add a bag from the short menu — or house-mark gear for the ritual.
        </Text>
        <Link href="/shop" asChild>
          <PrimaryButton label="Browse shop" />
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.note}>
          Coffee and merch may ship separately via our Shopify fulfillment
          partners (Dripshipper / Printful).
        </Text>

        {cart.lines.map((line) => (
          <View key={line.id} style={styles.line}>
            {line.merchandise.product.featuredImage?.url ? (
              <Image
                source={{ uri: line.merchandise.product.featuredImage.url }}
                style={styles.thumb}
              />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]} />
            )}
            <View style={styles.lineMeta}>
              <Text style={styles.lineTitle}>
                {line.merchandise.product.title}
              </Text>
              <Text style={styles.lineVariant}>
                {line.merchandise.selectedOptions
                  .map((o) => o.value)
                  .join(' · ')}
              </Text>
              <Text style={styles.linePrice}>
                {formatMoney(line.merchandise.price)}
              </Text>
              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() =>
                    setLineQuantity(line.id, Math.max(0, line.quantity - 1))
                  }
                  style={styles.qtyBtn}
                  disabled={busy}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{line.quantity}</Text>
                <Pressable
                  onPress={() => setLineQuantity(line.id, line.quantity + 1)}
                  style={styles.qtyBtn}
                  disabled={busy}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Pressable
                  onPress={() => removeLine(line.id)}
                  style={styles.remove}
                  disabled={busy}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totals}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>
            {formatMoney(cart.cost.subtotalAmount)}
          </Text>
        </View>
        <PrimaryButton
          label="Checkout"
          onPress={present}
          loading={busy}
          disabled={!cart.checkoutUrl}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  centered: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    gap: space.md,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: colors.espresso,
  },
  emptyCopy: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  content: { padding: space.lg, gap: space.md, paddingBottom: 140 },
  note: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  line: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 88,
    height: 110,
    borderRadius: radii.sm,
    backgroundColor: colors.creamAlt,
  },
  thumbFallback: { borderWidth: 1, borderColor: colors.border },
  lineMeta: { flex: 1, gap: 4 },
  lineTitle: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
  lineVariant: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  linePrice: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 15,
    color: colors.espresso,
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchment,
  },
  qtyBtnText: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 18,
    color: colors.espresso,
  },
  qty: {
    fontFamily: 'SourceSans3_600SemiBold',
    minWidth: 20,
    textAlign: 'center',
    color: colors.ink,
  },
  remove: { marginLeft: 'auto' },
  removeText: {
    fontFamily: 'SourceSans3_400Regular',
    color: colors.terracotta,
    fontSize: 14,
  },
  error: {
    fontFamily: 'SourceSans3_400Regular',
    color: colors.terracotta,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.lg,
    gap: space.md,
    backgroundColor: colors.parchment,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    color: colors.muted,
  },
  totalValue: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    color: colors.espresso,
  },
});
