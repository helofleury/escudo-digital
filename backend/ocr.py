"""OCR com Tesseract (pytesseract). Requer o binario do Tesseract instalado no sistema."""
from __future__ import annotations

import io

from PIL import Image
import pytesseract


def extract_text(data: bytes) -> str:
    image = Image.open(io.BytesIO(data))
    try:
        return pytesseract.image_to_string(image, lang="por+eng").strip()
    except pytesseract.TesseractError:
        return pytesseract.image_to_string(image).strip()
