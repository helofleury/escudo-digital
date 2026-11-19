import { Alert, StyleSheet, Switch, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { clearHistory } from '@/db/historyRepository';
import { appVersion, isBackendConfigured } from '@/services/api/analysisApi';
import { param } from '@/utils/params';

interface ToggleProps {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ title, description, value, onChange }: ToggleProps): React.JSX.Element {
  return (
    <View style={styles.toggle}>
      <View style={styles.flex}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" color={colors.muted}>{description}</AppText>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={title} />
    </View>
  );
}

const TITLES: Record<string, string> = {
  acessibilidade: 'Acessibilidade',
  privacidade: 'Privacidade',
  notificacoes: 'Notificações',
  ajuda: 'Ajuda e suporte',
  sobre: 'Sobre o Escudo Digital',
};

export default function SettingsDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = param(params.id);
  const { user } = useAuth();
  const { settings, update } = useSettings();

  const eraseHistory = (): void => {
    Alert.alert('Apagar histórico', 'Todas as suas análises serão removidas deste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          if (user !== null) clearHistory(user.id).catch(() => undefined);
        },
      },
    ]);
  };

  return (
    <Screen contentStyle={styles.content}>
      <ScreenHeader title={TITLES[id] ?? 'Ajustes'} />

      {id === 'acessibilidade' && (
        <Toggle title="Texto maior" description="Aumenta o tamanho das letras em todo o aplicativo." value={settings.largeText} onChange={(v) => void update({ largeText: v })} />
      )}

      {id === 'privacidade' && (
        <>
          <Toggle title="Salvar histórico" description="Guarda suas análises neste aparelho para consulta posterior." value={settings.saveHistory} onChange={(v) => void update({ saveHistory: v })} />
          <Button title="Apagar histórico" variant="danger" leftIcon="trash-outline" onPress={eraseHistory} />
          <AppText variant="caption" color={colors.muted}>
            Seus dados de conta e histórico ficam apenas neste aparelho.{isBackendConfigured ? ' O conteúdo que você analisa é enviado ao servidor de análise e não é armazenado por ele.' : ''}
          </AppText>
        </>
      )}

      {id === 'notificacoes' && (
        <Toggle title="Alertas de segurança" description="Receba lembretes e dicas de proteção digital." value={settings.notifications} onChange={(v) => void update({ notifications: v })} />
      )}

      {id === 'ajuda' && (
        <View style={styles.box}>
          <AppText variant="label">Como analisar algo suspeito?</AppText>
          <AppText variant="caption" color={colors.muted}>Toque em "Analisar agora", cole a mensagem ou o link (ou envie uma imagem) e aguarde o resultado.</AppText>
          <AppText variant="label" style={styles.gap}>O resultado é 100% garantido?</AppText>
          <AppText variant="caption" color={colors.muted}>Não. A análise é um indicativo. Na dúvida, confirme pelos canais oficiais.</AppText>
          <AppText variant="label" style={styles.gap}>Fui vítima de um golpe. E agora?</AppText>
          <AppText variant="caption" color={colors.muted}>Avise seu banco imediatamente, troque suas senhas e registre um boletim de ocorrência.</AppText>
        </View>
      )}

      {id === 'sobre' && (
        <View style={styles.box}>
          <AppText variant="label">Escudo Digital</AppText>
          <AppText variant="caption" color={colors.muted}>
            Assistente de segurança digital que usa inteligência artificial para identificar possíveis golpes e explicar o porquê.
          </AppText>
          <AppText variant="caption" color={colors.muted} style={styles.gap}>Versão {appVersion}</AppText>
          <AppText variant="caption" color={colors.muted}>Análise: {isBackendConfigured ? 'servidor (com modo local de reserva)' : 'modo local (mock)'}</AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 14 },
  gap: { marginTop: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 16 },
  box: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16, gap: 4 },
});
