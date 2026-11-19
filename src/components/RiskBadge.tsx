import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { RISK_STYLES } from '@/constants/risk';
import type { RiskLevel } from '@/types';

export function RiskBadge({ level }: { level: RiskLevel }): React.JSX.Element {
  const style = RISK_STYLES[level];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <AppText variant="caption" color={style.fg} style={styles.text}>{style.label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
});
