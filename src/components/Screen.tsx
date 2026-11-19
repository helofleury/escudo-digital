import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  bottomInset?: boolean;
}

export function Screen({ children, scroll = true, footer, background = colors.background, contentStyle, bottomInset = true }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: background, paddingTop: insets.top + 20 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {body}
      {footer !== undefined && <View style={[styles.footer, { paddingBottom: bottomInset ? Math.max(insets.bottom, 12) : 12 }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
});
