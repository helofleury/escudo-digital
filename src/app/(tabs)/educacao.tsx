import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { colors, radius } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchArticles } from '@/services/api/contentApi';
import type { Article } from '@/types';

type Filter = 'todas' | 'golpes' | 'dicas';

const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'golpes', label: 'Golpes comuns' },
  { value: 'dicas', label: 'Dicas' },
] as const;

const TONES: Record<Article['tone'], { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: colors.dangerBg },
  info: { fg: colors.info, bg: colors.infoBg },
  success: { fg: colors.success, bg: colors.successBg },
};

export default function EducationScreen(): React.JSX.Element {
  const router = useRouter();
  const articles = useAsync(fetchArticles);
  const [filter, setFilter] = useState<Filter>('todas');
  const visible = useMemo(
    () => (articles.data ?? []).filter((a) => filter === 'todas' || a.category === filter),
    [articles.data, filter],
  );

  return (
    <Screen contentStyle={styles.content}>
      <View>
        <AppText variant="title">Educação</AppText>
        <AppText variant="caption" color={colors.muted}>Conheça mais sobre segurança digital</AppText>
      </View>
      <SegmentedTabs options={FILTERS} value={filter} onChange={setFilter} />

      {articles.loading && <AppText variant="caption" color={colors.muted} style={styles.center}>Carregando conteúdos…</AppText>}
      {articles.error !== null && <AppText variant="caption" color={colors.danger} style={styles.center}>{articles.error}</AppText>}

      {visible.map((article) => {
        const tone = TONES[article.tone];
        return (
          <Pressable
            key={article.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/artigo/[id]', params: { id: article.id } })}
            style={styles.item}
          >
            <View style={[styles.tile, { backgroundColor: tone.bg }]}>
              <Ionicons name={article.icon} size={20} color={tone.fg} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label">{article.title}</AppText>
              <AppText variant="caption" color={colors.muted}>{article.minutes} min · {article.audience}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}

      <View style={styles.play}>
        <Ionicons name="bulb-outline" size={22} color={colors.primary} />
        <View style={styles.flex}>
          <AppText variant="label">Aprenda errando!</AppText>
          <AppText variant="caption" color={colors.muted}>Teste-se com exemplos reais no simulador.</AppText>
        </View>
        <Button title="Jogar" onPress={() => router.push('/simulador')} style={styles.playBtn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  content: { gap: 12, paddingTop: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 14 },
  tile: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  play: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 14, marginTop: 8 },
  playBtn: { minHeight: 40, paddingHorizontal: 18 },
});
