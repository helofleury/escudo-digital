import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { RiskBadge } from '@/components/RiskBadge';
import { Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { isRisky } from '@/constants/risk';
import { colors, radius } from '@/constants/theme';
import { useHistory } from '@/hooks/useHistory';
import type { ContentKind, HistoryItem, IconName } from '@/types';
import { formatHistoryDate, truncate } from '@/utils/format';

type Filter = 'todas' | 'seguras' | 'risco';

const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'seguras', label: 'Sem risco' },
  { value: 'risco', label: 'Com risco' },
] as const;

const KIND_ICON: Record<ContentKind, IconName> = {
  mensagem: 'chatbubble-outline',
  link: 'link-outline',
  imagem: 'image-outline',
};

function matches(item: HistoryItem, filter: Filter): boolean {
  if (filter === 'todas') return true;
  return filter === 'risco' ? isRisky(item.riskLevel) : !isRisky(item.riskLevel);
}

export default function HistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const { items, loading } = useHistory();
  const [filter, setFilter] = useState<Filter>('todas');
  const visible = useMemo(() => items.filter((item) => matches(item, filter)), [items, filter]);

  return (
    <Screen contentStyle={styles.content}>
      <AppText variant="title" style={styles.title}>Histórico</AppText>
      <SegmentedTabs options={FILTERS} value={filter} onChange={setFilter} />

      {!loading && visible.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={44} color={colors.primary} />
          <AppText variant="heading">Nada por aqui ainda</AppText>
          <AppText variant="caption" color={colors.muted} style={styles.center}>
            {items.length === 0 ? 'Suas análises aparecerão aqui.' : 'Nenhuma análise neste filtro.'}
          </AppText>
          {items.length === 0 && <Button title="Analisar agora" onPress={() => router.push('/nova-verificacao')} />}
        </View>
      ) : (
        <View style={styles.card}>
          {visible.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/resultado', params: { id: String(item.id) } })}
              style={[styles.row, index > 0 && styles.rowBorder]}
            >
              <Ionicons name={KIND_ICON[item.kind]} size={20} color={colors.primary} />
              <View style={styles.flex}>
                <AppText variant="label" numberOfLines={2}>{truncate(item.label, 48)}</AppText>
                <AppText variant="caption" color={colors.muted}>{formatHistoryDate(item.createdAt)}</AppText>
              </View>
              <RiskBadge level={item.riskLevel} />
            </Pressable>
          ))}
        </View>
      )}
      {items.length > 0 && (
        <AppText variant="caption" color={colors.muted} style={styles.center}>Sem sinais não garante que uma mensagem seja legítima.</AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 14, paddingTop: 12 },
  title: { marginBottom: 2 },
  center: { textAlign: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.primarySoft },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
});
