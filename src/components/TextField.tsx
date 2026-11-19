import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { colors, radius } from '@/constants/theme';
import type { IconName } from '@/types';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  icon: IconName;
  secure?: boolean;
}

export function TextField({ label, icon, secure = false, ...rest }: Props): React.JSX.Element {
  const [hidden, setHidden] = useState(secure);
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>{label}</AppText>
      <View style={styles.field}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <TextInput
          {...rest}
          accessibilityLabel={label}
          placeholderTextColor="#9A97B8"
          secureTextEntry={hidden}
          style={styles.input}
        />
        {secure && (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'} hitSlop={10} onPress={() => setHidden((h) => !h)}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontWeight: '800' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, minHeight: 50 },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
});
