"""API REST do Escudo Digital (FastAPI)."""
from __future__ import annotations

from typing import Any, Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analyzer import analyze

Level = Literal["basico", "intermediario", "avancado"]

app = FastAPI(title="Escudo Digital API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MAX_IMAGE_BYTES = 8 * 1024 * 1024


class AnalyzeBody(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
    level: Level = "basico"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze/message")
def analyze_message(body: AnalyzeBody) -> dict[str, Any]:
    return analyze("mensagem", body.content, body.level)


@app.post("/analyze/link")
def analyze_link(body: AnalyzeBody) -> dict[str, Any]:
    return analyze("link", body.content, body.level)


@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...), level: Level = Form("basico")) -> dict[str, Any]:
    from ocr import extract_text  # importado aqui para a API subir mesmo sem Tesseract

    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Imagem muito grande (máximo 8 MB).")
    try:
        text = extract_text(data)
    except Exception as exc:  # noqa: BLE001 - qualquer falha de OCR vira 422 legivel
        raise HTTPException(status_code=422, detail=f"Não foi possível ler a imagem: {exc}") from exc
    return analyze("imagem", file.filename or "imagem", level, extracted=text)
