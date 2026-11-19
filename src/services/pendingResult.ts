import type { HistoryItem } from '@/types';

// Guarda o resultado quando o usuário desativa o salvamento do histórico.
let pending: HistoryItem | null = null;

export function setPendingResult(item: HistoryItem | null): void {
  pending = item;
}

export function getPendingResult(): HistoryItem | null {
  return pending;
}
