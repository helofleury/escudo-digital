import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, radius } from '@/constants/theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({ options, value, onChange }: Props<T>): React.JSX.Element {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.item, active && styles.itemActive]}
          >
            <AppText variant="label" color={active ? colors.primary : colors.muted} style={styles.label}>{option.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 4 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.sm },
  itemActive: { backgroundColor: colors.white },
  label: { fontSize: 13, fontWeight: '800' },
});
