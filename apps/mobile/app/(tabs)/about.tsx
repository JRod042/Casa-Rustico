import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../../src/theme/tokens';

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Casa Rústico</Text>
      <Text style={styles.body}>
        Casa Rústico Coffee and Brews is built for the morning ritual: a cup that
        feels intentional, a short honest menu, and a house mark you can wear
        and drink from.
      </Text>
      <Text style={styles.body}>
        Our look and language draw from Puerto Rico’s highlands — mountain
        mornings, hacienda memory, the culture of coffee. Growing origin is
        always listed on each coffee; we only call a lot Puerto Rican-grown when
        it truly is.
      </Text>

      <View style={styles.block}>
        <Text style={styles.heading}>What we stand for</Text>
        <Text style={styles.item}>The cup first — aroma, roast character, weekday mornings</Text>
        <Text style={styles.item}>Clear origins — specialty lots we can describe honestly</Text>
        <Text style={styles.item}>A short menu — fewer origins, clearer grind and size choices</Text>
        <Text style={styles.item}>Quiet logistics — partner-roasted in the U.S. under our label</Text>
        <Text style={styles.item}>House-mark gear — hoodies, mugs, and glassware</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.heading}>Fulfillment</Text>
        <Text style={styles.body}>
          Orders placed in this app use the same Shopify checkout as{' '}
          rusticopr.com. Coffee is fulfilled by our roasting partner
          (Dripshipper); apparel and drinkware ship via Printful. Mixed carts may
          arrive in more than one package.
        </Text>
      </View>

      <Text
        style={styles.link}
        onPress={() => Linking.openURL('https://rusticopr.com')}
      >
        Visit rusticopr.com →
      </Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL('mailto:casarusticocorp@gmail.com')}
      >
        casarusticocorp@gmail.com
      </Text>
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
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 34,
    color: colors.espresso,
  },
  heading: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: colors.espresso,
    marginBottom: space.sm,
  },
  body: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  block: { marginTop: space.md, gap: space.sm },
  item: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    paddingLeft: space.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  link: {
    marginTop: space.sm,
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 16,
    color: colors.espresso,
  },
});
