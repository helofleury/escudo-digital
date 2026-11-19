import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';

export default function WelcomeScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Ionicons name="shield-checkmark-outline" size={46} color={colors.white} />
        </View>
        <AppText variant="display" color={colors.white} style={styles.brand}>Escudo Digital.</AppText>
        <AppText variant="heading" color={colors.white} style={styles.tagline}>Na dúvida, pergunte{'\n'}antes de clicar</AppText>
        <AppText variant="caption" color="#DAD3FF" style={styles.desc}>
          Verifique mensagens, links e imagens, e aprenda a se proteger de golpes digitais.
        </AppText>
      </View>
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
        <Button title="Começar agora" rightIcon="arrow-forward" onPress={() => router.push('/cadastro')} />
        <Button title="Já tenho conta" variant="outline" onPress={() => router.push('/login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#5340CF' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  iconBox: { width: 86, height: 86, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  brand: { textAlign: 'center' },
  tagline: { textAlign: 'center', fontSize: 19, lineHeight: 25 },
  desc: { textAlign: 'center', maxWidth: 260, fontSize: 13, lineHeight: 19 },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, gap: 10 },
});
