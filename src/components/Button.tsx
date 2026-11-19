import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { colors, radius } from '@/constants/theme';
import type { IconName } from '@/types';

type Variant = 'primary' | 'outline' | 'success' | 'danger' | 'soft';

const PALETTE: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  outline: { bg: colors.white, fg: colors.primary, border: colors.border },
  success: { bg: colors.successBg, fg: colors.success, border: '#86EFAC' },
  danger: { bg: colors.dangerBg, fg: colors.danger, border: '#FCA5A5' },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
};

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  leftIcon?: IconName;
  rightIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', leftIcon, rightIcon, loading = false, disabled = false, style }: Props): React.JSX.Element {
  const p = PALETTE[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, { backgroundColor: p.bg, borderColor: p.border, opacity: inactive ? 0.55 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {leftIcon !== undefined && <Ionicons name={leftIcon} size={18} color={p.fg} />}
          <AppText variant="label" color={p.fg} style={styles.text}>{title}</AppText>
          {rightIcon !== undefined && <Ionicons name={rightIcon} size={18} color={p.fg} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '800', fontSize: 16 },
});
