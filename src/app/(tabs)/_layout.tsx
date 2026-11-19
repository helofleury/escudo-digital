import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';
import type { IconName } from '@/types';

interface TabDef {
  name: string;
  title: string;
  icon: IconName;
  iconActive: IconName;
}

const TABS: readonly TabDef[] = [
  { name: 'inicio', title: 'Início', icon: 'home-outline', iconActive: 'home' },
  { name: 'historico', title: 'Histórico', icon: 'time-outline', iconActive: 'time' },
  { name: 'educacao', title: 'Educação', icon: 'book-outline', iconActive: 'book' },
  { name: 'perfil', title: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={typeof color === 'number' ? colors.muted : (color ?? colors.muted)} />,
            tabBarLabel: ({ focused, color }) => (
              <View style={styles.labelBox}>
                <AppText variant="caption" color={color?.toString() ?? colors.muted} style={styles.label}>{tab.title}</AppText>
                <View style={[styles.underline, focused && styles.underlineActive]} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  labelBox: { alignItems: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '800' },
  underline: { width: 22, height: 2, borderRadius: 1, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.primary },
});
