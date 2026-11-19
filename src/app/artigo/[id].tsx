import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { markRead } from '@/db/historyRepository';
import { useAsync } from '@/hooks/useAsync';
import { fetchArticle } from '@/services/api/contentApi';
import { param } from '@/utils/params';

export default function ArticleScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = param(params.id);
  const article = useAsync(() => fetchArticle(id));

  useEffect(() => {
    if (user !== null && article.data !== null) {
      markRead(user.id, `artigo-${article.data.id}`).catch(() => undefined);
    }
  }, [user, article.data]);

  const data = article.data;
  return (
    <Screen footer={<Button title="Testar no simulador" leftIcon="game-controller-outline" onPress={() => router.push('/simulador')} />} contentStyle={styles.content}>
      <ScreenHeader title="Educação" />
      {data === null ? (
        <AppText variant="caption" color={colors.muted} style={styles.center}>
          {article.loading ? 'Carregando…' : 'Conteúdo não encontrado.'}
        </AppText>
      ) : (
        <>
          <AppText variant="title">{data.title}</AppText>
          <AppText variant="caption" color={colors.muted}>{data.minutes} min · {data.audience}</AppText>
          <AppText variant="body" style={styles.intro}>{data.intro}</AppText>
          {data.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <View style={styles.sectionHead}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <AppText variant="heading">{section.heading}</AppText>
              </View>
              <AppText variant="body" color={colors.muted}>{section.body}</AppText>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  content: { gap: 10 },
  intro: { marginTop: 4, marginBottom: 6 },
  section: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16, gap: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
