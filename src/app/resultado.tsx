import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { RISK_STYLES } from '@/constants/risk';
import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getHistoryItem } from '@/db/historyRepository';
import { getPendingResult } from '@/services/pendingResult';
import { isBackendConfigured } from '@/services/api/analysisApi';
import type { Finding, HistoryItem } from '@/types';
import { param } from '@/utils/params';

function FindingCard({ finding }: { finding: Finding }): React.JSX.Element {
  const strong = finding.weight >= 0.25;
  const fg = strong ? colors.danger : colors.orange;
  return (
    <View style={[styles.card, { backgroundColor: strong ? colors.dangerBg : colors.orangeBg }]}>
      <Ionicons name="warning-outline" size={18} color={fg} />
      <View style={styles.flex}>
        <AppText variant="label" color={fg}>{finding.title}</AppText>
        <AppText variant="caption" color={fg}>{finding.description}</AppText>
      </View>
    </View>
  );
}

export default function ResultScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const id = param(params.id);
    if (id === 'atual') {
      setItem(getPendingResult());
      return;
    }
    if (user === null) return;
    getHistoryItem(user.id, Number(id)).then(setItem).catch(() => setItem(null));
  }, [params.id, user]);

  const goHome = (): void => router.replace('/inicio');

  if (item === null) {
    return (
      <Screen footer={<Button title="Voltar para o início" onPress={goHome} />}>
        <ScreenHeader title="Resultado" onBack={goHome} />
        <AppText variant="caption" color={colors.muted} style={styles.center}>Carregando resultado…</AppText>
      </Screen>
    );
  }

  const risk = RISK_STYLES[item.riskLevel];
  const shown = item.findings.slice(0, 4);
  const share = (): void => {
    void Share.share({ message: `Escudo Digital: ${item.title} (${risk.label}). ${item.summary}` });
  };

  return (
    <Screen footer={<Button title="Voltar para o início" onPress={goHome} />} contentStyle={styles.content}>
      <ScreenHeader title="Resultado" rightIcon="share-outline" onRightPress={share} onBack={goHome} />

      <View style={styles.hero}>
        <View style={[styles.iconBox, { backgroundColor: risk.solid }]}>
          <Ionicons name={risk.icon} size={38} color={colors.white} />
        </View>
        <View style={[styles.tag, { backgroundColor: risk.bg }]}>
          <AppText variant="caption" color={risk.fg} style={styles.tagText}>{risk.label}</AppText>
        </View>
        <AppText variant="title" style={styles.center}>{item.title}</AppText>
        <AppText variant="caption" color={colors.muted} style={styles.center}>{item.subtitle}</AppText>
      </View>

      <AppText variant="heading" style={styles.section}>O que chamou nossa atenção?</AppText>
      {shown.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.successBg }]}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          <View style={styles.flex}>
            <AppText variant="label" color={colors.success}>Nenhum sinal comum de golpe</AppText>
            <AppText variant="caption" color={colors.success}>Não encontramos urgência, links suspeitos ou pedidos de dados.</AppText>
          </View>
        </View>
      ) : (
        shown.map((finding) => <FindingCard key={finding.id} finding={finding} />)
      )}

      <View style={[styles.card, { backgroundColor: colors.infoBg }]}>
        <Ionicons name="shield-outline" size={18} color={colors.info} />
        <View style={styles.flex}>
          <AppText variant="label" color={colors.info}>O que fazer?</AppText>
          <AppText variant="caption" color={colors.info}>{item.advice}</AppText>
        </View>
      </View>

      <AppText variant="body" style={styles.summary}>{item.summary}</AppText>

      {item.extractedText !== null && (
        <View style={styles.ocr}>
          <AppText variant="caption" color={colors.muted} style={styles.ocrTitle}>Texto lido da imagem</AppText>
          <AppText variant="caption">{item.extractedText}</AppText>
          {item.demoOcr && (
            <AppText variant="caption" color={colors.muted} style={styles.demo}>
              Modo demonstração: a leitura da imagem é simulada.{isBackendConfigured ? '' : ' Conecte o backend para usar o OCR real.'}
            </AppText>
          )}
        </View>
      )}

      <AppText variant="caption" color={colors.muted}>Indicativo, não garantia.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  content: { gap: 10 },
  hero: { alignItems: 'center', gap: 8, marginBottom: 6 },
  iconBox: { width: 76, height: 76, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  section: { marginTop: 6 },
  card: { flexDirection: 'row', gap: 10, borderRadius: radius.md, padding: 14 },
  summary: { marginTop: 4 },
  ocr: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, gap: 4 },
  ocrTitle: { fontWeight: '800' },
  demo: { fontStyle: 'italic', marginTop: 4 },
});
