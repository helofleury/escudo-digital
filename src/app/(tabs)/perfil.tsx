import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { LEVELS, LEVEL_LABEL } from '@/constants/levels';
import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { IconName } from '@/types';

interface Row {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
}

const ROWS: readonly Row[] = [
  
  { id: 'acessibilidade', icon: 'text-outline', title: 'Acessibilidade', subtitle: 'Tamanho do texto e contraste' },
  { id: 'privacidade', icon: 'lock-closed-outline', title: 'Privacidade', subtitle: 'Gerencie seus dados pessoais' },
  { id: 'notificacoes', icon: 'notifications-outline', title: 'Notificações', subtitle: 'Receba alertas de segurança' },
  { id: 'ajuda', icon: 'help-circle-outline', title: 'Ajuda e suporte', subtitle: 'Tire suas dúvidas' },
  { id: 'sobre', icon: 'information-circle-outline', title: 'Sobre o Escudo Digital', subtitle: 'Conheça o projeto' },
  
];

export default function ProfileScreen(): React.JSX.Element | null {
  const router = useRouter();
  const { user, signOut, changeLevel } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  if (user === null) return null;

  const confirmSignOut = (): void => {
  Alert.alert('Sair da conta', 'Deseja realmente sair?', [
    {
      text: 'Cancelar',
      style: 'cancel',
    },
    {
      text: 'Sair',
      style: 'destructive',
      onPress: async () => {
        try {
          await signOut();
          router.replace('/(tabs)/inicio');
        } catch {
          Alert.alert(
            'Erro',
            'Não foi possível sair da conta. Tente novamente.',
          );
        }
      },
    },
  ]);
};

  return ( 
    <Screen contentStyle={styles.content}>
      <AppText variant="title" style={styles.title}>Perfil e ajustes</AppText>

      <View style={styles.who}>
        <View style={styles.avatar}>
          <AppText variant="heading" color={colors.white}>{user.name.trim().charAt(0).toUpperCase()}</AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="heading">{user.name}</AppText>
          <AppText variant="caption" color={colors.muted}>{user.email}</AppText>
        </View>
      </View>

      <View style={styles.levelCard}>
        <View style={styles.flex}>
          <AppText variant="caption" color={colors.muted} style={styles.levelLabel}>NÍVEL DE CONHECIMENTO</AppText>
          <AppText variant="heading">{LEVEL_LABEL[user.level]}</AppText>
        </View>
        <Button title="Personalizar" variant="outline" onPress={() => setPickerOpen(true)} style={styles.levelBtn} />
      </View>

      <View style={styles.list}>
        {ROWS.map((row, index) => (
          <Pressable
            key={row.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/ajustes/[id]', params: { id: row.id } })}
            style={[styles.row, index > 0 && styles.rowBorder]}
          >
            <Ionicons name={row.icon} size={22} color={colors.primary} />
            <View style={styles.flex}>
              <AppText variant="label">{row.title}</AppText>
              <AppText variant="caption" color={colors.muted}>{row.subtitle}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      <Button title="Sair da conta" variant="danger" leftIcon="log-out-outline" onPress={confirmSignOut} />

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.sheet}>
            <AppText variant="heading">Como você se sente com tecnologia?</AppText>
            <AppText variant="caption" color={colors.muted}>Adaptamos a linguagem das explicações ao seu nível.</AppText>
            {LEVELS.map((item) => {
              const selected = item.value === user.level;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    void changeLevel(item.value);
                    setPickerOpen(false);
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={styles.flex}>
                    <AppText variant="label">{item.title}</AppText>
                    <AppText variant="caption" color={colors.muted}>{item.subtitle}</AppText>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 14, paddingTop: 12 },
  title: { marginBottom: 2 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  levelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 10 },
  levelLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  levelBtn: { minHeight: 40, paddingHorizontal: 16 },
  list: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.primarySoft },
  backdrop: { flex: 1, backgroundColor: 'rgba(30,27,75,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 10, paddingBottom: 36 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, padding: 14 },
  optionSelected: { borderColor: colors.primary },
});
