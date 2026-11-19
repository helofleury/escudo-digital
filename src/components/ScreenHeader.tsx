import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';
import type { IconName } from '@/types';

interface Props {
  title?: string;
  rightIcon?: IconName;
  onRightPress?: () => void;
  onBack?: () => void;
}

export function ScreenHeader({ title, rightIcon, onRightPress, onBack }: Props): React.JSX.Element {
  const router = useRouter();
  const goBack = (): void => {
    if (onBack !== undefined) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/inicio');
  };
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={12} onPress={goBack} style={styles.side}>
        <Ionicons name="chevron-back" size={26} color={colors.primary} />
      </Pressable>
      <AppText variant="heading" style={styles.title}>{title ?? ''}</AppText>
      <View style={[styles.side, styles.right]}>
        {rightIcon !== undefined && onRightPress !== undefined && (
          <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar" hitSlop={12} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 52 },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
