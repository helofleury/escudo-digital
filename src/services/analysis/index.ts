import { adviceFor, buildSummary, levelFromScore, verdictFor } from '@/services/analysis/explain';
import { simulateOcr } from '@/services/analysis/mockOcr';
import { combineWeights, detectTextFindings, extractUrls } from '@/services/analysis/textRules';
import { analyzeUrl } from '@/services/analysis/urlAnalyzer';
import type { AnalysisRequest, AnalysisResult, Finding } from '@/types';

function dedupe(findings: readonly Finding[]): Finding[] {
  const seen = new Map<string, Finding>();
  for (const f of findings) {
    if (!seen.has(f.id)) seen.set(f.id, f);
  }
  return Array.from(seen.values()).sort((a, b) => b.weight - a.weight);
}

/** Motor de análise local (mock): roda no próprio celular, sem backend. */
export function analyzeLocally(request: AnalysisRequest): AnalysisResult {
  let text = request.content;
  let extractedText: string | null = null;
  let demoOcr = false;

  if (request.kind === 'imagem') {
    text = simulateOcr(request.content + request.label);
    extractedText = text;
    demoOcr = true;
  }

  const findings: Finding[] = [];
  const urls = request.kind === 'link' ? [request.content.trim()] : extractUrls(text);
  if (request.kind !== 'link') findings.push(...detectTextFindings(text));
  for (const url of urls) findings.push(...analyzeUrl(url));

  const ranked = dedupe(findings);
  const score = combineWeights(ranked.map((f) => f.weight));
  const riskLevel = levelFromScore(score);
  const verdict = verdictFor(riskLevel);

  return {
    kind: request.kind,
    riskLevel,
    score,
    title: verdict.title,
    subtitle: verdict.subtitle,
    summary: buildSummary(riskLevel, ranked, request.level, score),
    findings: ranked,
    advice: adviceFor(riskLevel),
    extractedText,
    demoOcr,
    source: 'local',
  };
}
