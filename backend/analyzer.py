"""Motor de analise do Escudo Digital (espelha o motor local do app)."""
from __future__ import annotations

import re
import unicodedata
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import joblib

from train_model import extract

MODEL_PATH = Path(__file__).parent / "url_model.joblib"

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "is.gd", "ow.ly", "rb.gy", "shorturl.at", "tiny.cc", "encurtador.com.br"}
RISKY_TLDS = {"xyz", "top", "click", "tk", "ml", "ga", "cf", "gq", "icu", "buzz", "cyou", "rest", "zip", "mov", "work", "support", "link", "monster"}
BRANDS = ["nubank", "itau", "bradesco", "caixa", "santander", "correios", "receita", "mercadolivre", "paypal", "netflix", "amazon", "apple", "google", "microsoft", "instagram", "whatsapp", "facebook", "picpay", "serasa"]
SECOND_LEVEL = {"com", "org", "gov", "net", "edu"}

TEXT_RULES: list[tuple[str, str, str, float, str]] = [
    ("urgencia", "Urgência artificial", "A mensagem pede uma ação imediata.", 0.30,
     r"(urgente|imediat|agora mesmo|em ate \d+ ?(h|horas)|\b24 ?h|ultimas? horas|expira|prazo final|bloquead|suspens|ultimo aviso)"),
    ("premio", "Promessa de prêmio ou dinheiro fácil", "Ofertas boas demais para ser verdade são um sinal clássico de golpe.", 0.40,
     r"(voce ganhou|ganhou um|sorteado|premio|heranca|dinheiro gratis|lucro garantido|renda extra|ganhe \d|resgate seu)"),
    ("dados", "Pedido de dados pessoais", "Empresas sérias não pedem senha, código ou dados do cartão por mensagem.", 0.40,
     r"((envie|informe|passe|mande|digite|confirme|atualize|fornec\w*|me passa)\b.{0,40}(senha|\bcpf\b|cartao|codigo|\btoken\b|dados)|dados bancarios|numero do cartao|confirme seus dados|atualize seus dados)"),
    ("pix", "Pedido de pagamento ou Pix", "Cobranças inesperadas por Pix, boleto ou taxas são muito usadas por golpistas.", 0.30,
     r"(\bpix\b|transferencia|boleto|deposit|taxa de (liberacao|envio|desbloqueio)|faca o pagamento|pague)"),
    ("novo-numero", 'Golpe do "novo número"', "Alguém diz ser um parente com número novo e pede dinheiro. Ligue para o contato antigo.", 0.35,
     r"(meu numero novo|mudei de numero|troquei de (numero|celular)|oi (mae|pai)|sou seu (filho|filha))"),
    ("ameaca", "Ameaça ou pressão emocional", "Golpistas usam medo para você agir sem pensar.", 0.20,
     r"(cancelad|negativad|processo judicial|multa|mandado|inadimpl|sua conta sera|perdera|sera cancelado)"),
    ("sigilo", "Pedido de segredo", "Pedir para não contar a ninguém impede que você confirme com outra pessoa.", 0.25,
     r"(nao conte|nao fale com|segredo|nao avise)"),
    ("clique", "Pede para você clicar", "Evite tocar em links recebidos sem ter certeza de quem enviou.", 0.15,
     r"(clique|acesse (o )?(link|site)|toque aqui|regularize|link abaixo|baixe o (app|aplicativo))"),
    ("identidade", "Possível falsa identidade", "A mensagem cita uma empresa ou órgão conhecido. Confirme pelos canais oficiais.", 0.15,
     r"(banco|receita federal|correios|\binss\b|detran|serasa|nubank|caixa|itau|bradesco|santander|mercado livre|sua conta|central de seguranca)"),
]

URL_PATTERN = re.compile(
    r"((?:https?://|www\.)[^\s<>\"']+|(?:[a-z0-9-]+\.)+(?:com|net|org|br|io|xyz|top|click|ly|co|me|app|link|info|biz|site|online)(?:/[^\s<>\"']*)?)",
    re.IGNORECASE,
)

ADVICE = {
    "alto": "Não clique no link. Acesse o site oficial do banco ou entre em contato pelos canais oficiais.",
    "medio": "Não responda nem clique por enquanto. Confirme com a empresa ou a pessoa por outro canal, como o site oficial ou uma ligação.",
    "atencao": "Antes de agir, confirme a origem digitando o endereço oficial no navegador ou ligando para o número que você já conhece.",
    "seguro": "Se algo ainda parecer estranho, confie na sua intuição e confirme pelos canais oficiais.",
}
VERDICTS = {
    "alto": ("Possível tentativa de golpe", "Identificamos características comuns de mensagens fraudulentas."),
    "medio": ("Conteúdo bastante suspeito", "Encontramos vários sinais que merecem cuidado."),
    "atencao": ("Vale ter atenção", "Há alguns sinais isolados. Confirme antes de agir."),
    "seguro": ("Nenhum sinal de golpe encontrado", "Mesmo assim, fique atento: a análise é apenas indicativa."),
}


@dataclass
class Finding:
    id: str
    title: str
    description: str
    weight: float


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn")


@lru_cache(maxsize=1)
def _bundle() -> dict[str, Any]:
    return joblib.load(MODEL_PATH)


def model_probability(url: str) -> float:
    bundle = _bundle()
    x = bundle["scaler"].transform([extract(url, bundle["tld_prob"])])
    return float(bundle["model"].predict_proba(x)[0][1])


def combine(weights: list[float]) -> float:
    remaining = 1.0
    for w in weights:
        remaining *= 1 - w
    return min(1.0, max(0.0, 1 - remaining))


def _registered_domain(host: str) -> str:
    parts = host.split(".")
    if len(parts) <= 2:
        return host
    if len(parts[-1]) == 2 and parts[-2] in SECOND_LEVEL:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def analyze_url(url: str) -> list[Finding]:
    parsed = urlparse(url if "://" in url else "http://" + url)
    host = (parsed.hostname or "").lower()
    rest = parsed.path + ("?" + parsed.query if parsed.query else "")
    domain = _registered_domain(host)
    tld = host.rsplit(".", 1)[-1]
    out: list[Finding] = []

    def add(fid: str, title: str, desc: str, weight: float) -> None:
        out.append(Finding(fid, title, desc, weight))

    if domain in SHORTENERS:
        add("link-encurtado", "Link encurtado", "O endereço esconde o destino real. Não dá para saber para onde ele leva.", 0.35)
    if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
        add("link-ip", "Endereço numérico", "Sites confiáveis usam nomes, não números de IP.", 0.5)
    if "@" in url:
        add("link-arroba", "Endereço disfarçado", "O símbolo @ pode esconder o verdadeiro destino do link.", 0.4)
    if "xn--" in host:
        add("link-punycode", "Letras que imitam outras", "O endereço usa caracteres especiais para parecer outro site.", 0.4)
    if len(host.split(".")) - 2 >= 3:
        add("link-subdominios", "Muitos subdomínios", "Endereços longos e cheios de pontos costumam esconder o site verdadeiro.", 0.25)
    flat = re.sub(r"[-_.]", "", host + rest)
    brand = next((b for b in BRANDS if b in flat), None)
    if brand is not None and domain.split(".")[0] != brand:
        add("link-marca", "Link suspeito", "O endereço não corresponde ao domínio oficial.", 0.45)
    if tld in RISKY_TLDS:
        add("link-tld", "Terminação incomum", f"Endereços terminados em .{tld} são muito usados em golpes.", 0.25)
    if parsed.scheme == "http":
        add("link-http", "Conexão sem criptografia", "O endereço não usa https, o que é incomum em sites sérios.", 0.15)
    if host.count("-") >= 3:
        add("link-hifens", "Endereço com muitos hífens", "Nomes muito emendados são comuns em páginas falsas.", 0.15)
    p = model_probability(url)
    if p >= 0.5:
        cap = 0.3 if not out else 0.5
        add("link-ia", "Padrão típico de links maliciosos",
            "Nosso modelo comparou o endereço com milhares de links conhecidos e encontrou semelhanças com golpes.",
            min(cap, (p - 0.5) + 0.1))
    return out


def detect_text(text: str) -> list[Finding]:
    n = normalize(text)
    return [Finding(i, t, d, w) for i, t, d, w, rx in TEXT_RULES if re.search(rx, n)]


def level_from_score(score: float) -> str:
    if score >= 0.6:
        return "alto"
    if score >= 0.4:
        return "medio"
    if score >= 0.2:
        return "atencao"
    return "seguro"


def build_summary(level: str, findings: list[Finding], knowledge: str, score: float) -> str:
    if not findings:
        return "Não encontramos sinais comuns de golpe neste conteúdo."
    top = [f.title.lower() for f in findings[:3]]
    listing = ", ".join(top[:-1]) + " e " + top[-1] if len(top) > 1 else top[0]
    if knowledge == "basico":
        if level in ("seguro", "atencao"):
            return f"Vimos alguns pontos de atenção: {listing}. Na dúvida, não clique."
        return f"Isso parece golpe. Vimos sinais de {listing}. Na dúvida, não clique e não responda."
    pct = round(score * 100)
    if knowledge == "intermediario":
        return f"Pontuação de risco {pct}/100. Sinais detectados: {listing}. Confirme a origem por um canal oficial antes de agir."
    return (f"Pontuação de risco {pct}/100, combinando regras de linguagem, análise estrutural das URLs e um classificador "
            f"treinado em links reais de phishing. Sinais: {listing}.")


def analyze(kind: str, content: str, level: str, extracted: str | None = None) -> dict[str, Any]:
    text = extracted if extracted is not None else content
    findings: list[Finding] = []
    urls = [content.strip()] if kind == "link" else [m.rstrip(".,;:!?)]") for m in URL_PATTERN.findall(text)]
    if kind != "link":
        findings += detect_text(text)
    for u in dict.fromkeys(urls):
        findings += analyze_url(u)
    unique: dict[str, Finding] = {}
    for f in findings:
        unique.setdefault(f.id, f)
    ranked = sorted(unique.values(), key=lambda f: f.weight, reverse=True)
    score = combine([f.weight for f in ranked])
    risk = level_from_score(score)
    title, subtitle = VERDICTS[risk]
    return {
        "kind": kind,
        "risk_level": risk,
        "score": round(score, 4),
        "title": title,
        "subtitle": subtitle,
        "summary": build_summary(risk, ranked, level, score),
        "findings": [asdict(f) for f in ranked],
        "advice": ADVICE[risk],
        "extracted_text": extracted,
    }
