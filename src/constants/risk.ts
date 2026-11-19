import { colors } from '@/constants/theme';
import type { IconName, RiskLevel } from '@/types';

interface RiskStyle {
  label: string;
  fg: string;
  bg: string;
  solid: string;
  icon: IconName;
}

export const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  alto: { label: 'ALTO RISCO', fg: colors.danger, bg: colors.dangerBg, solid: colors.danger, icon: 'warning-outline' },
  medio: { label: 'MÉDIO RISCO', fg: colors.orange, bg: colors.orangeBg, solid: colors.orange, icon: 'warning-outline' },
  atencao: { label: 'ATENÇÃO', fg: colors.amber, bg: colors.amberBg, solid: colors.star, icon: 'alert-circle-outline' },
  seguro: { label: 'SEM RISCO', fg: colors.success, bg: colors.successBg, solid: colors.success, icon: 'shield-checkmark-outline' },
};

export function isRisky(level: RiskLevel): boolean {
  return level !== 'seguro';
}
