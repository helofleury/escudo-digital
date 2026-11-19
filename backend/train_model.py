"""Treina um classificador de URLs (phishing x legitima) com o dataset PhiUSIIL.

Usa apenas features calculaveis a partir da propria URL, para que o mesmo
calculo possa ser feito no backend (FastAPI) e no app (modo offline).
Gera: url_model.joblib (backend) e ../src/data/urlModel.json (app).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURES = [
    "urlLength",
    "domainLength",
    "isIp",
    "subdomains",
    "isHttps",
    "digitRatio",
    "letterRatio",
    "specialRatio",
    "equals",
    "qmarks",
    "ampersands",
    "obfuscated",
    "tldLength",
    "tldLegit",
]


def extract(url: str, tld_prob: dict[str, float]) -> list[float]:
    parsed = urlparse(url if "://" in url else "http://" + url)
    host = (parsed.hostname or "").lower()
    parts = host.split(".")
    tld = parts[-1] if len(parts) > 1 else ""
    is_ip = 1.0 if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host) else 0.0
    sub = max(len(parts) - 2, 0)
    if parts and parts[0] == "www":
        sub = max(sub - 1, 0)
    n = max(len(url), 1)
    letters = sum(c.isalpha() for c in url)
    digits = sum(c.isdigit() for c in url)
    special = n - letters - digits
    return [
        float(len(url)),
        float(len(host)),
        is_ip,
        float(sub),
        1.0 if parsed.scheme == "https" else 0.0,
        digits / n,
        letters / n,
        special / n,
        float(url.count("=")),
        float(url.count("?")),
        float(url.count("&")),
        float(len(re.findall(r"%[0-9a-fA-F]{2}", url))),
        float(len(tld)),
        tld_prob.get(tld, 0.0),
    ]


def main() -> None:
    csv = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("PhiUSIIL_Phishing_URL_Dataset.csv")
    df = pd.read_csv(csv, usecols=["URL", "TLD", "TLDLegitimateProb", "label"])
    # No dataset: label 1 = legitima, 0 = phishing. Aqui: y = 1 significa golpe.
    df["y"] = 1 - df["label"]
    tld_prob = (
        df.assign(tld=df["TLD"].astype(str).str.lower())
        .groupby("tld")["TLDLegitimateProb"]
        .mean()
        .round(4)
        .to_dict()
    )
    x = np.array([extract(str(u), tld_prob) for u in df["URL"]], dtype=float)
    y = df["y"].to_numpy()
    x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler().fit(x_tr)
    model = LogisticRegression(max_iter=2000, class_weight="balanced")
    model.fit(scaler.transform(x_tr), y_tr)
    print(classification_report(y_te, model.predict(scaler.transform(x_te)), target_names=["legitima", "golpe"]))

    joblib.dump({"model": model, "scaler": scaler, "tld_prob": tld_prob, "features": FEATURES}, "url_model.joblib")

    top_tlds = dict(sorted(tld_prob.items(), key=lambda kv: kv[0])[:0])
    counts = df["TLD"].astype(str).str.lower().value_counts()
    top_tlds = {t: tld_prob[t] for t in counts.index[:150]}
    out = {
        "features": FEATURES,
        "mean": scaler.mean_.round(6).tolist(),
        "scale": scaler.scale_.round(6).tolist(),
        "coef": model.coef_[0].round(6).tolist(),
        "intercept": float(round(model.intercept_[0], 6)),
        "tldProb": top_tlds,
    }
    target = Path(__file__).resolve().parent.parent / "src" / "data" / "urlModel.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(out, ensure_ascii=False))
    print("modelo exportado para", target)


if __name__ == "__main__":
    main()
