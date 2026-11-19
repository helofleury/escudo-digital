import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

export function Logo(): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Ionicons name="shield-checkmark" size={30} color={colors.primary} />
      <View style={styles.divider} />
      <View>
        <AppText variant="label" style={styles.word}>Escudo</AppText>
        <AppText variant="label" style={styles.word}>Digital.</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { width: 1.5, height: 30, backgroundColor: colors.border },
  word: { fontWeight: '900', fontSize: 15, lineHeight: 17 },
});
