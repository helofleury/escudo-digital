
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useAsync } from '@/hooks/useAsync';
import { useHistory } from '@/hooks/useHistory';
import { fetchTips } from '@/services/api/contentApi';
import type { HistoryItem, RiskLevel } from '@/types';
import { firstName } from '@/utils/format';

interface StatProps {
  icon: 'shield-checkmark' | 'stats-chart' | 'star';
  color: string;
  value: string;
  label: string;
}

function Stat({ icon, color, value, label }: StatProps): React.JSX.Element {
  const { colors } = useSettings();

  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={25} color={color} />
      <AppText variant="heading" style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.muted} style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

const RISK_INFO: Record<
  RiskLevel,
  {
    label: string;
    color: string;
    background: string;
    icon: 'checkmark-circle' | 'alert-circle' | 'warning';
  }
> = {
  seguro: {
    label: 'Seguro',
    color: '#15803D',
    background: '#DCFCE7',
    icon: 'checkmark-circle',
  },
  atencao: {
    label: 'Atenção',
    color: '#A16207',
    background: '#FEF3C7',
    icon: 'alert-circle',
  },
  medio: {
    label: 'Suspeito',
    color: '#C2410C',
    background: '#FFEDD5',
    icon: 'warning',
  },
  alto: {
    label: 'Perigoso',
    color: '#C62828',
    background: '#FDE2E2',
    icon: 'warning',
  },
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--/--';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getContentIcon(kind: HistoryItem['kind']): 'link-outline' | 'image-outline' | 'chatbubble-outline' {
  if (kind === 'link') return 'link-outline';
  if (kind === 'imagem') return 'image-outline';
  return 'chatbubble-outline';
}

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useSettings();

  const { items, tipsRead, loading } = useHistory();
  const tips = useAsync(fetchTips);

  const list = tips.data ?? [];
  const current = list.length > 0 ? list[0] : undefined;

  const security = Math.min(
    100,
    80 + Math.min(20, items.length * 2 + tipsRead),
  );

  const recentItems = useMemo(
    () => [...items]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 2),
    [items],
  );

  const protectionTitle = security >= 90
    ? 'Sua proteção está em dia'
    : 'Sua proteção pode melhorar';

  const protectionDescription = security >= 90
    ? 'Continue seguindo nossas dicas para se manter seguro.'
    : 'Explore nossos conteúdos e fortaleça sua segurança digital.';

  return (
    <Screen
      background={colors.background}
      contentStyle={styles.content}
    >
      {/* Cabeçalho */}
      <View style={styles.top}>
        <Logo />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() => router.push('/ajustes/notificacoes')}
        >
          <Ionicons
            name="notifications-outline"
            size={26}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* Saudação */}
      <View
        style={[
          styles.hero,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <View style={styles.heroText}>
          <AppText variant="title" style={styles.heroTitle}>
            Olá, {user !== null ? firstName(user.name) : ''}!
          </AppText>

          <AppText
            variant="caption"
            color={colors.muted}
            style={styles.heroSub}
          >
            Sua segurança digital sempre em primeiro lugar.
          </AppText>
        </View>

        <View
          style={[
            styles.phone,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={34}
            color={colors.success}
          />
        </View>
      </View>

      {/* Indicadores */}
      <View style={styles.stats}>
        <Stat
          icon="shield-checkmark"
          color={colors.success}
          value={`${security}%`}
          label="Segurança"
          
        />

        <Stat
          icon="stats-chart"
          color={colors.primary}
          value={String(items.length)}
          label="Análises"
        />

        <Stat
          icon="star"
          color={colors.star}
          value={String(tipsRead)}
          label="Dicas lidas"
        />
      </View>

      {/* Botão principal */}
      <Button
        title="Analisar agora"
        leftIcon="search"
        onPress={() => router.push('/nova-verificacao')}
        style={styles.cta}
      />

      {/* Status da proteção */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/historico')}
        style={[
          styles.protectionCard,
          {
            backgroundColor: colors.successBg,
            borderColor: colors.successBg,
          },
        ]}
      >
        <View
          style={[
            styles.protectionIcon,
            { borderColor: colors.success },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={58}
            color={colors.success}
          />
        </View>

        <View style={styles.protectionText}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.surface },
            ]}
          >
            <AppText
              variant="caption"
              color={colors.success}
              style={styles.statusBadgeText}
            >
              {security >= 90 ? 'Tudo certo!' : 'Atenção'}
            </AppText>
          </View>

          <AppText variant="label">
            {protectionTitle}
          </AppText>

          <AppText variant="caption" color={colors.muted}>
            {protectionDescription}
          </AppText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.success}
        />
      </Pressable>

      {/* Últimas análises */}
      <View
        style={[
          styles.historyCard,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons
              name="time-outline"
              size={23}
              color={colors.text}
            />
            <AppText variant="label">
              Últimas análises
            </AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/historico')}
            style={styles.seeAll}
          >
            <AppText variant="caption" color={colors.primary}>
              Ver todas
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {loading ? (
          <AppText variant="caption" color={colors.muted}>
            Carregando análises...
          </AppText>
        ) : recentItems.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons
              name="document-text-outline"
              size={26}
              color={colors.muted}
            />
            <AppText variant="caption" color={colors.muted}>
              Suas análises recentes aparecerão aqui.
            </AppText>
          </View>
        ) : (
          recentItems.map((item, index) => (
            <HistoryRow
              key={item.id}
              item={item}
              last={index === recentItems.length - 1}
            />
          ))
        )}
      </View>

      {/* Alerta da semana */}
      <View
        style={[
          styles.alertCard,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <View
          style={[
            styles.alertIcon,
            { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons
            name="megaphone-outline"
            size={29}
            color={colors.primary}
          />
        </View>

        <View style={styles.alertText}>
          <AppText variant="label">
            Alerta da semana
          </AppText>

          <AppText variant="caption" color={colors.muted}>
            {current?.text ??
              'Fique atento a links suspeitos e ofertas muito vantajosas.'}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/educacao')}
          style={[
            styles.learnButton,
            { backgroundColor: colors.primary },
          ]}
        >
          <AppText color="#FFFFFF" variant="caption">
            Saiba mais
          </AppText>
        </Pressable>
      </View>

      {/* Mensagem institucional */}
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <AppText
          variant="body"
          color={colors.primary}
          style={styles.panelText}
        >
          Aprenda, proteja-se e navegue com segurança.
        </AppText>

        <Ionicons
          name="heart-outline"
          size={28}
          color={colors.primary}
        />
      </View>
    </Screen>
  );
}

interface HistoryRowProps {
  item: HistoryItem;
  last: boolean;
}

function HistoryRow({
  item,
  last,
}: HistoryRowProps): React.JSX.Element {
  const { colors } = useSettings();
  const router = useRouter();

  const risk = RISK_INFO[item.riskLevel];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/resultado')}
      style={[
        styles.historyRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.contentIcon,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Ionicons
          name={getContentIcon(item.kind)}
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.historyLabel}>
        <AppText variant="caption" numberOfLines={1}>
          {item.label}
        </AppText>
      </View>

      <View
        style={[
          styles.riskBadge,
          { backgroundColor: risk.background },
        ]}
      >
        <Ionicons
          name={risk.icon}
          size={15}
          color={risk.color}
        />
        <AppText
          variant="caption"
          color={risk.color}
          style={styles.riskText}
        >
          {risk.label}
        </AppText>
      </View>

      <AppText
        variant="caption"
        color={colors.muted}
        style={styles.date}
      >
        {formatDate(item.createdAt)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 18,
    minHeight: 125,
  },
  heroText: {
    flex: 1,
    gap: 5,
  },
  heroSub: {
    maxWidth: 205,
  },
  heroTitle: {
    fontSize: 20,
    
  },
  phone: {
    width: 65,
    height: 98,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '10deg' }],
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
  },
  cta: {
    marginTop: 0,
    
  },
  protectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    minHeight: 135,
  },
  protectionIcon: {
    width: 76,
    height: 76,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectionText: {
    flex: 1,
    gap: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontWeight: '700',
  },
  historyCard: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  emptyHistory: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  contentIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLabel: {
    flex: 1,
    minWidth: 0,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  riskText: {
    fontSize: 11,
  },
  date: {
    minWidth: 42,
    textAlign: 'right',
    fontSize: 11,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.lg,
    padding: 14,
  },
  alertIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
    gap: 4,
  },
  learnButton: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    padding: 15,
  },
  medal: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    flex: 1,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  panel: {
    minHeight: 145,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  panelText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
