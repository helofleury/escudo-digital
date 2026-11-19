import type { Finding, KnowledgeLevel, RiskLevel } from '@/types';

interface Verdict {
  title: string;
  subtitle: string;
}

const VERDICTS: Record<RiskLevel, Verdict> = {
  alto: { title: 'Possível tentativa de golpe', subtitle: 'Identificamos características comuns de mensagens fraudulentas.' },
  medio: { title: 'Conteúdo bastante suspeito', subtitle: 'Encontramos vários sinais que merecem cuidado.' },
  atencao: { title: 'Vale ter atenção', subtitle: 'Há alguns sinais isolados. Confirme antes de agir.' },
  seguro: { title: 'Nenhum sinal de golpe encontrado', subtitle: 'Mesmo assim, fique atento: a análise é apenas indicativa.' },
};

const ADVICE: Record<RiskLevel, string> = {
  alto: 'Não clique no link. Acesse o site oficial do banco ou entre em contato pelos canais oficiais.',
  medio: 'Não responda nem clique por enquanto. Confirme com a empresa ou a pessoa por outro canal, como o site oficial ou uma ligação.',
  atencao: 'Antes de agir, confirme a origem digitando o endereço oficial no navegador ou ligando para o número que você já conhece.',
  seguro: 'Se algo ainda parecer estranho, confie na sua intuição e confirme pelos canais oficiais.',
};

export function verdictFor(level: RiskLevel): Verdict {
  return VERDICTS[level];
}

export function adviceFor(level: RiskLevel): string {
  return ADVICE[level];
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 0.6) return 'alto';
  if (score >= 0.4) return 'medio';
  if (score >= 0.2) return 'atencao';
  return 'seguro';
}

/** Explicação em linguagem adaptada ao nível de familiaridade do usuário. */
export function buildSummary(level: RiskLevel, findings: readonly Finding[], knowledge: KnowledgeLevel, score: number): string {
  if (findings.length === 0) {
    return 'Não encontramos sinais comuns de golpe neste conteúdo.';
  }
  const top = findings.slice(0, 3).map((f) => f.title.toLowerCase());
  const list = top.length > 1 ? `${top.slice(0, -1).join(', ')} e ${top[top.length - 1] ?? ''}` : (top[0] ?? '');
  if (knowledge === 'basico') {
    return level === 'seguro' || level === 'atencao'
      ? `Vimos alguns pontos de atenção: ${list}. Na dúvida, não clique.`
      : `Isso parece golpe. Vimos sinais de ${list}. Na dúvida, não clique e não responda.`;
  }
  const pct = Math.round(score * 100);
  if (knowledge === 'intermediario') {
    return `Pontuação de risco ${pct}/100. Sinais detectados: ${list}. Confirme a origem por um canal oficial antes de agir.`;
  }
  return `Pontuação de risco ${pct}/100, combinando regras de linguagem, análise estrutural das URLs e um classificador treinado em links reais de phishing. Sinais: ${list}.`;
}
