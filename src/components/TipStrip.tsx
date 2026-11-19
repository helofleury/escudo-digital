import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { colors, radius } from '@/constants/theme';

export function TipStrip({ children }: { children: string }): React.JSX.Element {
  return (
    <View style={styles.box}>
      <Ionicons name="bulb-outline" size={16} color={colors.primary} />
      <AppText variant="caption" color={colors.primary} style={styles.text}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12 },
  text: { flex: 1, fontWeight: '600' },
});
