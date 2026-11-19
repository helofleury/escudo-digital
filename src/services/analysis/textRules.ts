import type { Finding } from '@/types';

interface TextRule {
  id: string;
  title: string;
  description: string;
  weight: number;
  pattern: RegExp;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const RULES: readonly TextRule[] = [
  {
    id: 'urgencia',
    title: 'Urgência artificial',
    description: 'A mensagem pede uma ação imediata.',
    weight: 0.3,
    pattern: /(urgente|imediat|agora mesmo|em ate \d+ ?(h|horas)|\b24 ?h|ultimas? horas|expira|prazo final|bloquead|suspens|ultimo aviso)/,
  },
  {
    id: 'premio',
    title: 'Promessa de prêmio ou dinheiro fácil',
    description: 'Ofertas boas demais para ser verdade são um sinal clássico de golpe.',
    weight: 0.4,
    pattern: /(voce ganhou|ganhou um|sorteado|premio|heranca|dinheiro gratis|lucro garantido|renda extra|ganhe \d|resgate seu)/,
  },
  {
    id: 'dados',
    title: 'Pedido de dados pessoais',
    description: 'Empresas sérias não pedem senha, código ou dados do cartão por mensagem.',
    weight: 0.4,
    pattern: /((envie|informe|passe|mande|digite|confirme|atualize|fornec\w*|me passa)\b.{0,40}(senha|\bcpf\b|cartao|codigo|\btoken\b|dados)|dados bancarios|numero do cartao|confirme seus dados|atualize seus dados)/,
  },
  {
    id: 'pix',
    title: 'Pedido de pagamento ou Pix',
    description: 'Cobranças inesperadas por Pix, boleto ou taxas são muito usadas por golpistas.',
    weight: 0.3,
    pattern: /(\bpix\b|transferencia|boleto|deposit|taxa de (liberacao|envio|desbloqueio)|faca o pagamento|pague)/,
  },
  {
    id: 'novo-numero',
    title: 'Golpe do "novo número"',
    description: 'Alguém diz ser um parente com número novo e pede dinheiro. Ligue para o contato antigo.',
    weight: 0.35,
    pattern: /(meu numero novo|mudei de numero|troquei de (numero|celular)|oi (mae|pai)|sou seu (filho|filha))/,
  },
  {
    id: 'ameaca',
    title: 'Ameaça ou pressão emocional',
    description: 'Golpistas usam medo para você agir sem pensar.',
    weight: 0.2,
    pattern: /(cancelad|negativad|processo judicial|multa|mandado|inadimpl|sua conta sera|perdera|sera cancelado)/,
  },
  {
    id: 'sigilo',
    title: 'Pedido de segredo',
    description: 'Pedir para não contar a ninguém impede que você confirme com outra pessoa.',
    weight: 0.25,
    pattern: /(nao conte|nao fale com|segredo|nao avise)/,
  },
  {
    id: 'clique',
    title: 'Pede para você clicar',
    description: 'Evite tocar em links recebidos sem ter certeza de quem enviou.',
    weight: 0.15,
    pattern: /(clique|acesse (o )?(link|site)|toque aqui|regularize|link abaixo|baixe o (app|aplicativo))/,
  },
  {
    id: 'identidade',
    title: 'Possível falsa identidade',
    description: 'A mensagem cita uma empresa ou órgão conhecido. Confirme pelos canais oficiais.',
    weight: 0.15,
    pattern: /(banco|receita federal|correios|\binss\b|detran|serasa|nubank|caixa|itau|bradesco|santander|mercado livre|sua conta|central de seguranca)/,
  },
];

export function detectTextFindings(text: string): Finding[] {
  const normalized = normalize(text);
  return RULES.filter((rule) => rule.pattern.test(normalized)).map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    weight: rule.weight,
  }));
}

const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9-]+\.)+(?:com|net|org|br|io|xyz|top|click|ly|co|me|app|link|info|biz|site|online)(?:\/[^\s<>"']*)?)/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? [];
  const cleaned = matches.map((m) => m.replace(/[.,;:!?)\]]+$/, ''));
  return Array.from(new Set(cleaned));
}

export function combineWeights(weights: readonly number[]): number {
  const remaining = weights.reduce((acc, w) => acc * (1 - w), 1);
  return Math.min(1, Math.max(0, 1 - remaining));
}
