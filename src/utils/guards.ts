import type { AnalysisSource, ContentKind, Finding, KnowledgeLevel, RiskLevel } from '@/types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isKnowledgeLevel(value: unknown): value is KnowledgeLevel {
  return value === 'basico' || value === 'intermediario' || value === 'avancado';
}

export function isContentKind(value: unknown): value is ContentKind {
  return value === 'mensagem' || value === 'link' || value === 'imagem';
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'seguro' || value === 'atencao' || value === 'medio' || value === 'alto';
}

export function isAnalysisSource(value: unknown): value is AnalysisSource {
  return value === 'api' || value === 'local';
}

export function isFinding(value: unknown): value is Finding {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.weight === 'number'
  );
}

export function parseFindings(raw: string): Finding[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isFinding) : [];
  } catch {
    return [];
  }
}
