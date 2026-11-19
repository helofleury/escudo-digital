import Constants from 'expo-constants';
import { analyzeLocally } from '@/services/analysis';
import type { AnalysisRequest, AnalysisResult } from '@/types';
import { isContentKind, isFinding, isRecord, isRiskLevel } from '@/utils/guards';

const API_URL: string | undefined = process.env.EXPO_PUBLIC_API_URL;
const TIMEOUT_MS = 20000;

export const isBackendConfigured: boolean = typeof API_URL === 'string' && API_URL.length > 0;

function parseResult(payload: unknown): AnalysisResult | null {
  if (!isRecord(payload)) return null;
  const { kind, risk_level: riskLevel, score, title, subtitle, summary, findings, advice, extracted_text: extracted } = payload;
  if (!isContentKind(kind) || !isRiskLevel(riskLevel)) return null;
  if (typeof score !== 'number' || typeof title !== 'string' || typeof subtitle !== 'string') return null;
  if (typeof summary !== 'string' || typeof advice !== 'string' || !Array.isArray(findings)) return null;
  return {
    kind,
    riskLevel,
    score,
    title,
    subtitle,
    summary,
    advice,
    findings: findings.filter(isFinding),
    extractedText: typeof extracted === 'string' ? extracted : null,
    demoOcr: false,
    source: 'api',
  };
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callBackend(request: AnalysisRequest): Promise<AnalysisResult> {
  if (API_URL === undefined) throw new Error('Backend não configurado');
  let response: Response;
  if (request.kind === 'imagem') {
    const form = new FormData();
    const name = request.label.length > 0 ? request.label : 'imagem.jpg';
    form.append('file', { uri: request.content, name, type: 'image/jpeg' } as unknown as Blob);
    form.append('level', request.level);
    response = await fetchWithTimeout(`${API_URL}/analyze/image`, { method: 'POST', body: form });
  } else {
    response = await fetchWithTimeout(`${API_URL}/analyze/${request.kind === 'link' ? 'link' : 'message'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: request.content, level: request.level }),
    });
  }
  if (!response.ok) throw new Error(`API respondeu ${response.status}`);
  const payload: unknown = await response.json();
  const parsed = parseResult(payload);
  if (parsed === null) throw new Error('Resposta inválida da API');
  return parsed;
}

/**
 * Analisa o conteúdo. Com EXPO_PUBLIC_API_URL definido, usa o backend FastAPI;
 * se ele estiver fora do ar (ou não configurado), usa o motor local (mock).
 */
export async function analyzeContent(request: AnalysisRequest): Promise<AnalysisResult> {
  if (isBackendConfigured) {
    try {
      return await callBackend(request);
    } catch {
      // Sem conexão com o backend: segue com a análise local.
    }
  }
  return analyzeLocally(request);
}

export const appVersion: string = Constants.expoConfig?.version ?? '1.0.0';
