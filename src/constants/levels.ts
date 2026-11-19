import type { KnowledgeLevel } from '@/types';

export const LEVELS: readonly { value: KnowledgeLevel; title: string; subtitle: string }[] = [
  { value: 'basico', title: 'Básica', subtitle: 'Estou começando' },
  { value: 'intermediario', title: 'Intermediária', subtitle: 'Uso com frequência' },
  { value: 'avancado', title: 'Avançada', subtitle: 'Me sinto familiarizado' },
];

export const LEVEL_LABEL: Record<KnowledgeLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};
