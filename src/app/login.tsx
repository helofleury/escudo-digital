import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/utils/format';

export default function LoginScreen(): React.JSX.Element {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    if (!isValidEmail(email) || password.length === 0) return setError('Informe seu e-mail e sua senha.');
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button title="Entrar" loading={busy} onPress={submit} />
          <Button title="Criar uma conta" variant="outline" onPress={() => router.replace('/cadastro')} />
        </>
      }
    >
      <ScreenHeader />
      <AppText variant="title" style={styles.title}>Bem-vindo de volta</AppText>
      <AppText variant="caption" color={colors.muted}>Entre para continuar protegendo você e sua família.</AppText>
      <View style={styles.form}>
        <TextField label="E-mail" icon="mail-outline" placeholder="nome@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Senha" icon="lock-closed-outline" placeholder="Sua senha" value={password} onChangeText={setPassword} secure autoCapitalize="none" textContentType="password" />
        {error !== null && <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{error}</AppText>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 4, marginBottom: 2 },
  form: { gap: 12, marginTop: 24 },
});
