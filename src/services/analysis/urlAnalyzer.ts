import model from '@/data/urlModel.json';
import type { Finding } from '@/types';

const tldProb: Readonly<Record<string, number>> = model.tldProb;

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'is.gd', 'ow.ly', 'rb.gy', 'shorturl.at', 'tiny.cc', 'encurtador.com.br'];
const RISKY_TLDS = ['xyz', 'top', 'click', 'tk', 'ml', 'ga', 'cf', 'gq', 'icu', 'buzz', 'cyou', 'rest', 'zip', 'mov', 'work', 'support', 'link', 'monster'];
const BRANDS = ['nubank', 'itau', 'bradesco', 'caixa', 'santander', 'correios', 'receita', 'mercadolivre', 'paypal', 'netflix', 'amazon', 'apple', 'google', 'microsoft', 'instagram', 'whatsapp', 'facebook', 'picpay', 'serasa'];
const SECOND_LEVEL = ['com', 'org', 'gov', 'net', 'edu'];

interface ParsedUrl {
  scheme: string;
  host: string;
  rest: string;
}

export function parseUrl(raw: string): ParsedUrl {
  const trimmed = raw.trim();
  const match = /^(?:([a-z][a-z0-9+.-]*):\/\/)?([^/?#]*)(.*)$/i.exec(trimmed);
  const scheme = (match?.[1] ?? 'http').toLowerCase();
  const authority = match?.[2] ?? '';
  const afterUser = authority.includes('@') ? authority.slice(authority.lastIndexOf('@') + 1) : authority;
  const host = afterUser.replace(/:\d+$/, '').toLowerCase();
  return { scheme, host, rest: match?.[3] ?? '' };
}

function count(text: string, char: string): number {
  return text.split(char).length - 1;
}

export function extractFeatures(url: string): number[] {
  const { scheme, host } = parseUrl(url);
  const parts = host.split('.');
  const tld = parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? 1 : 0;
  let subdomains = Math.max(parts.length - 2, 0);
  if (parts[0] === 'www') subdomains = Math.max(subdomains - 1, 0);
  const n = Math.max(url.length, 1);
  const letters = (url.match(/\p{L}/gu) ?? []).length;
  const digits = (url.match(/[0-9]/g) ?? []).length;
  const obfuscated = (url.match(/%[0-9a-fA-F]{2}/g) ?? []).length;
  return [
    url.length,
    host.length,
    isIp,
    subdomains,
    scheme === 'https' ? 1 : 0,
    digits / n,
    letters / n,
    (n - letters - digits) / n,
    count(url, '='),
    count(url, '?'),
    count(url, '&'),
    obfuscated,
    tld.length,
    tldProb[tld] ?? 0,
  ];
}

/** Probabilidade (0 a 1) de a URL ser maliciosa, segundo o modelo treinado no dataset PhiUSIIL. */
export function modelProbability(url: string): number {
  const x = extractFeatures(url);
  let z = model.intercept;
  for (let i = 0; i < x.length; i += 1) {
    const scale = model.scale[i] ?? 1;
    z += (model.coef[i] ?? 0) * (((x[i] ?? 0) - (model.mean[i] ?? 0)) / (scale === 0 ? 1 : scale));
  }
  return 1 / (1 + Math.exp(-z));
}

function registeredDomain(host: string): string {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const last = parts[parts.length - 1] ?? '';
  const second = parts[parts.length - 2] ?? '';
  if (last.length === 2 && SECOND_LEVEL.includes(second)) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

export function analyzeUrl(url: string): Finding[] {
  const { scheme, host, rest } = parseUrl(url);
  const findings: Finding[] = [];
  const add = (id: string, title: string, description: string, weight: number): void => {
    findings.push({ id, title, description, weight });
  };
  const domain = registeredDomain(host);
  const tld = host.split('.').pop() ?? '';

  if (SHORTENERS.includes(domain)) {
    add('link-encurtado', 'Link encurtado', 'O endereço esconde o destino real. Não dá para saber para onde ele leva.', 0.35);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    add('link-ip', 'Endereço numérico', 'Sites confiáveis usam nomes, não números de IP.', 0.5);
  }
  if (url.includes('@')) {
    add('link-arroba', 'Endereço disfarçado', 'O símbolo @ pode esconder o verdadeiro destino do link.', 0.4);
  }
  if (host.includes('xn--')) {
    add('link-punycode', 'Letras que imitam outras', 'O endereço usa caracteres especiais para parecer outro site.', 0.4);
  }
  if (host.split('.').length - 2 >= 3) {
    add('link-subdominios', 'Muitos subdomínios', 'Endereços longos e cheios de pontos costumam esconder o site verdadeiro.', 0.25);
  }
  const brand = BRANDS.find((b) => (host + rest).replace(/[-_.]/g, '').includes(b));
  if (brand !== undefined) {
    const label = domain.split('.')[0] ?? '';
    if (label !== brand) {
      add('link-marca', 'Link suspeito', 'O endereço não corresponde ao domínio oficial.', 0.45);
    }
  }
  if (RISKY_TLDS.includes(tld)) {
    add('link-tld', 'Terminação incomum', `Endereços terminados em .${tld} são muito usados em golpes.`, 0.25);
  }
  if (scheme === 'http') {
    add('link-http', 'Conexão sem criptografia', 'O endereço não usa https, o que é incomum em sites sérios.', 0.15);
  }
  if (count(host, '-') >= 3) {
    add('link-hifens', 'Endereço com muitos hífens', 'Nomes muito emendados são comuns em páginas falsas.', 0.15);
  }
  const p = modelProbability(url);
  if (p >= 0.5) {
    // Sozinho, o modelo só gera um alerta leve (o dataset favorece domínios simples);
    // junto de outros sinais, ele reforça a suspeita.
    const cap = findings.length === 0 ? 0.3 : 0.5;
    add('link-ia', 'Padrão típico de links maliciosos', 'Nosso modelo comparou o endereço com milhares de links conhecidos e encontrou semelhanças com golpes.', Math.min(cap, (p - 0.5) * 1.0 + 0.1));
  }
  return findings;
}
