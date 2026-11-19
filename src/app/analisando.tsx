import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { TipStrip } from '@/components/TipStrip';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { saveAnalysis } from '@/db/historyRepository';
import { QUICK_TIPS } from '@/data/tips';
import { analyzeContent } from '@/services/api/analysisApi';
import { wait } from '@/services/api/delay';
import { setPendingResult } from '@/services/pendingResult';
import type { ContentKind } from '@/types';
import { isContentKind } from '@/utils/guards';
import { param } from '@/utils/params';

const STEPS = ['Identificando padrões de golpe', 'Analisando links e conteúdo', 'Consultando nossa IA'] as const;
/** Tempo mínimo de tela de análise, para o usuário perceber o processo. */
const MIN_DURATION_MS = 4500;

export default function AnalyzingScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ kind?: string; content?: string; label?: string }>();
  const [done, setDone] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const started = useRef(false);
  const tip = QUICK_TIPS[1]?.text ?? '';

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    if (started.current || user === null) return;
    started.current = true;
    const rawKind = param(params.kind);
    const kind: ContentKind = isContentKind(rawKind) ? rawKind : 'mensagem';
    const content = param(params.content);
    const label = param(params.label) || content;
    let cancelled = false;
    const timers = [
      setTimeout(() => setDone(1), 1500),
      setTimeout(() => setDone(2), 3000),
    ];

    (async () => {
      try {
        const [result] = await Promise.all([
          analyzeContent({ kind, content, label, level: user.level }),
          wait(MIN_DURATION_MS),
        ]);
        if (cancelled) return;
        setDone(3);
        await wait(450);
        if (settings.saveHistory) {
          const id = await saveAnalysis(user.id, content, label, result);
          router.replace({ pathname: '/resultado', params: { id: String(id) } });
        } else {
          setPendingResult({ ...result, id: 0, content, label, createdAt: new Date().toISOString() });
          router.replace({ pathname: '/resultado', params: { id: 'atual' } });
        }
      } catch {
        if (cancelled) return;
        Alert.alert('Não foi possível analisar', 'Tente novamente em instantes.');
        router.back();
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // A análise deve rodar uma única vez por abertura da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Screen scroll={false} contentStyle={styles.content} footer={<TipStrip>{`Dica: ${tip.charAt(0).toLowerCase()}${tip.slice(1)}`}</TipStrip>}>
      <View style={styles.center}>
        <View style={styles.ringWrap}>
          <View style={styles.ringTrack} />
          <Animated.View style={[styles.ringArc, { transform: [{ rotate }] }]} />
          <View style={styles.core}>
            <Ionicons name="shield" size={30} color={colors.primary} />
          </View>
        </View>
        <AppText variant="title" style={styles.title}>Analisando{'\n'}sua mensagem...</AppText>
        <View style={styles.steps} accessibilityLiveRegion="polite">
          {STEPS.map((label, index) => {
            const complete = index < done;
            return (
              <View key={label} style={styles.step}>
                <View style={[styles.check, complete && styles.checkDone]}>
                  {complete && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <AppText variant="label" color={complete ? colors.text : colors.muted}>{label}</AppText>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const SIZE = 150;

const styles = StyleSheet.create({
  content: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 },
  ringWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ringTrack: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 12, borderColor: colors.primarySoft },
  ringArc: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 12, borderColor: 'transparent', borderTopColor: colors.primary, borderRightColor: colors.primary },
  core: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center' },
  steps: { gap: 14, alignSelf: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
});
