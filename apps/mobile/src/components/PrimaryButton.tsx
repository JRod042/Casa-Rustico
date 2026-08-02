import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors, radii, space } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'solid' | 'ghost' | 'inverse';
};

export const PrimaryButton = forwardRef<any, Props>(function PrimaryButton(
  {
    label,
    onPress,
    disabled,
    loading,
    style,
    variant = 'solid',
  },
  ref,
) {
  const isGhost = variant === 'ghost';
  const isInverse = variant === 'inverse';

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGhost ? styles.ghost : isInverse ? styles.inverse : styles.solid,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isGhost || isInverse ? colors.espresso : colors.onDark}
        />
      ) : (
        <Text
          style={[
            styles.label,
            (isGhost || isInverse) && styles.darkLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  solid: {
    backgroundColor: colors.espresso,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.espresso,
  },
  inverse: {
    backgroundColor: colors.cream,
  },
  label: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 16,
    color: colors.onDark,
  },
  darkLabel: {
    color: colors.espresso,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88 },
});
