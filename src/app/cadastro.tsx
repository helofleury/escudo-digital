import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { LEVELS } from '@/constants/levels';
import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { KnowledgeLevel } from '@/types';
import { isValidEmail } from '@/utils/format';

export default function SignUpScreen(): React.JSX.Element {
  const { signUp } = useAuth();
  const [level, setLevel] = useState<KnowledgeLevel>('basico');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    if (name.trim().length < 2) return setError('Informe seu nome.');
    if (!isValidEmail(email)) return setError('Informe um e-mail válido.');
    if (password.length < 8) return setError('A senha precisa ter no mínimo 8 caracteres.');
    setError(null);
    setBusy(true);
    try {
      await signUp(name, email, password, level);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={<Button title="Continuar" loading={busy} onPress={submit} />}
    >
      <ScreenHeader />
      <AppText variant="title" style={styles.title}>Crie sua conta</AppText>
      <AppText variant="caption" color={colors.muted}>Leva menos de um minuto.</AppText>
      <AppText variant="caption" style={styles.question}>Como você se sente em relação à tecnologia?</AppText>
      <View style={styles.levels}>
        {LEVELS.map((item) => {
          const selected = item.value === level;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setLevel(item.value)}
              style={[styles.level, selected && styles.levelSelected]}
            >
              <View style={styles.flex}>
                <AppText variant="label">{item.title}</AppText>
                <AppText variant="caption" color={colors.muted}>{item.subtitle}</AppText>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.form}>
        <TextField label="Nome" icon="person-outline" placeholder="Heloísa Fleury Jardim" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
        <TextField label="E-mail" icon="mail-outline" placeholder="nome@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Senha" icon="lock-closed-outline" placeholder="Mínimo de 8 caracteres" value={password} onChangeText={setPassword} secure autoCapitalize="none" textContentType="newPassword" />
        {error !== null && <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{error}</AppText>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginTop: 4 },
  question: { fontWeight: '800', marginTop: 14, marginBottom: 8 },
  levels: { gap: 8 },
  level: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11 },
  levelSelected: { borderColor: colors.primary, backgroundColor: '#F7F5FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  form: { gap: 12, marginTop: 16 },
});
