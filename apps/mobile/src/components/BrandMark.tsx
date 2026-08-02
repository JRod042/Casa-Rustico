import { StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../theme/tokens';

type Props = {
  size?: 'sm' | 'lg';
  light?: boolean;
};

export function BrandMark({ size = 'sm', light = false }: Props) {
  const large = size === 'lg';
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.mark,
          large && styles.markLg,
          light && styles.light,
        ]}
      >
        Casa Rústico
      </Text>
      {!large ? null : (
        <Text style={[styles.tag, light && styles.lightMuted]}>
          Single-origin coffee · short menu · shop the collection
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  mark: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: colors.espresso,
    letterSpacing: 0.2,
  },
  markLg: {
    fontSize: 42,
    lineHeight: 48,
  },
  tag: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 15,
    color: colors.muted,
    maxWidth: 320,
  },
  light: { color: colors.onDark },
  lightMuted: { color: 'rgba(247, 243, 236, 0.78)' },
});
