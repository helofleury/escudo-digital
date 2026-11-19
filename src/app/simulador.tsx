import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TipStrip } from '@/components/TipStrip';
import { colors, radius } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchQuiz } from '@/services/api/contentApi';

export default function SimulatorScreen(): React.JSX.Element {
  const router = useRouter();
  const quiz = useAsync(fetchQuiz);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [hits, setHits] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = quiz.data ?? [];
  const total = questions.length;
  const question = questions[index];

  const restart = (): void => {
    setIndex(0);
    setAnswer(null);
    setHits(0);
    setFinished(false);
  };

  const respond = (saysScam: boolean): void => {
    if (question === undefined || answer !== null) return;
    setAnswer(saysScam);
    if (saysScam === question.isScam) setHits((h) => h + 1);
  };

  const next = (): void => {
    if (index + 1 >= total) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setAnswer(null);
    }
  };

  const footer = <TipStrip>Aprenda errando! Aqui você aprende com exemplos reais de golpes.</TipStrip>;

  if (finished) {
    return (
      <Screen footer={footer} contentStyle={styles.endContent}>
        <ScreenHeader title="Simulador" />
        <View style={styles.end}>
          <Ionicons name={hits >= total - 1 ? 'trophy-outline' : 'school-outline'} size={56} color={colors.primary} />
          <AppText variant="title">{hits} de {total} acertos</AppText>
          <AppText variant="body" color={colors.muted} style={styles.center}>
            {hits === total ? 'Perfeito! Você reconhece os golpes com facilidade.' : 'Continue praticando. Cada erro aqui é um golpe a menos na vida real.'}
          </AppText>
          <Button title="Jogar de novo" onPress={restart} />
          <Button title="Voltar" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const correct = answer !== null && question !== undefined && answer === question.isScam;

  return (
    <Screen footer={footer}>
      <ScreenHeader title="Simulador" />
      <AppText variant="caption" color={colors.muted}>Teste seus conhecimentos e aprenda a identificar um golpe!</AppText>

      {question === undefined ? (
        <AppText variant="caption" color={colors.muted} style={[styles.center, styles.gap]}>
          {quiz.error ?? 'Carregando perguntas…'}
        </AppText>
      ) : (
        <>
          <View style={styles.progressRow}>
            <AppText variant="caption" style={styles.bold}>Pergunta {index + 1} de {total}</AppText>
            <AppText variant="caption" color={colors.muted} style={styles.bold}>{hits} acertos</AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${((index + (answer === null ? 0 : 1)) / total) * 100}%` }]} />
          </View>

          <View style={styles.sms}>
            <AppText variant="caption" color={colors.muted} style={styles.bold}>{question.channel}</AppText>
            <View style={styles.bubble}>
              <AppText variant="label">{question.sender}</AppText>
              <AppText variant="caption">{question.body}</AppText>
              {question.link !== null && <AppText variant="caption" color={colors.primary} style={styles.bold}>{question.link}</AppText>}
              <AppText variant="caption" color={colors.muted} style={styles.time}>{question.time}</AppText>
            </View>
          </View>

          <AppText variant="heading" style={[styles.center, styles.ask]}>Essa mensagem é confiável?</AppText>

          {answer === null ? (
            <View style={styles.answers}>
              <Button title="É segura" variant="success" leftIcon="checkmark" onPress={() => respond(false)} />
              <Button title="É um golpe" variant="danger" leftIcon="warning-outline" onPress={() => respond(true)} />
            </View>
          ) : (
            <View style={styles.answers}>
              <View style={[styles.feedback, { backgroundColor: correct ? colors.successBg : colors.dangerBg }]} accessibilityLiveRegion="polite">
                <AppText variant="label" color={correct ? colors.success : colors.danger}>
                  {correct ? 'Você acertou!' : 'Não foi dessa vez.'} {question.isScam ? 'Era um golpe.' : 'Era uma mensagem legítima.'}
                </AppText>
                <AppText variant="caption" color={correct ? colors.success : colors.danger}>{question.explanation}</AppText>
              </View>
              <Button title={index + 1 >= total ? 'Ver resultado' : 'Próxima pergunta'} onPress={next} />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  gap: { marginTop: 24 },
  bold: { fontWeight: '800' },
  endContent: { flexGrow: 1 },
  end: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 40 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.primarySoft, marginTop: 6, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  sms: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, gap: 8, marginTop: 16 },
  bubble: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12, gap: 4 },
  time: { alignSelf: 'flex-end', fontSize: 10 },
  ask: { marginTop: 22, marginBottom: 14 },
  answers: { gap: 12 },
  feedback: { borderRadius: radius.md, padding: 14, gap: 4 },
});
