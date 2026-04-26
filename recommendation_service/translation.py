"""
translation.py
==============
Detects Arabic text and translates it to English using Groq.
Called once at the start of the pipeline before any analysis.

Why Groq and not a separate translation API?
- Already in the stack, no extra API key needed
- Handles Arabic very well
- Batch processing keeps API calls minimal
"""

import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = "llama3-70b-8192"

logger = logging.getLogger(__name__)


def is_arabic(text: str) -> bool:
    """
    Returns True if the text contains Arabic characters.
    Uses Unicode range U+0600 to U+06FF which covers the Arabic block.
    """
    return any('\u0600' <= char <= '\u06FF' for char in str(text))


def translate_batch(texts: list[str]) -> list[str]:
    """
    Sends a batch of Arabic texts to Groq and returns English translations.
    Texts are sent numbered so Groq returns them in the same order.
    """
    numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts))

    prompt = f"""Translate the following Arabic texts to English.
Return ONLY a JSON array of translated strings in the same order as the input.
No explanation, no numbering in the output, just the JSON array.

Texts to translate:
{numbered}
"""
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if Groq wraps the response
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())


def translate_to_english(texts: list[str], batch_size: int = 30) -> list[str]:
    """
    Main translation function. Takes a list of texts (Arabic or English mixed),
    translates only the Arabic ones, and returns the full list with English only.

    Args:
        texts:      List of complaint texts (may be Arabic, English, or mixed)
        batch_size: How many Arabic texts to send per Groq call (default 30)
                    Keep this low to avoid hitting token limits

    Returns:
        Same list with Arabic texts replaced by their English translations.
        English texts are returned unchanged.

    Example:
        Input:  ["Network is slow", "الواي فاي لا يعمل في المكتبة"]
        Output: ["Network is slow", "The wifi does not work in the library"]
    """
    result = list(texts)  # copy so we don't modify the original

    # Find which indices need translation
    indices_to_translate = [
        i for i, t in enumerate(texts)
        if t and is_arabic(str(t))
    ]

    if not indices_to_translate:
        logger.info("No Arabic texts found, skipping translation.")
        return result

    logger.info("Translating %d Arabic texts to English...", len(indices_to_translate))

    # Process in batches to avoid token limit
    for batch_start in range(0, len(indices_to_translate), batch_size):
        batch_indices = indices_to_translate[batch_start : batch_start + batch_size]
        batch_texts   = [texts[i] for i in batch_indices]

        try:
            translations = translate_batch(batch_texts)

            # Make sure Groq returned the same number of translations
            if len(translations) != len(batch_indices):
                logger.warning(
                    "Translation count mismatch: sent %d, got %d. Keeping originals for this batch.",
                    len(batch_indices), len(translations)
                )
                continue

            # Put translations back in the right positions
            for i, idx in enumerate(batch_indices):
                result[idx] = translations[i]

        except Exception as exc:
            logger.error("Translation batch failed: %s. Keeping original texts.", exc)
            # Don't crash the pipeline — keep original Arabic text
            # Groq will still understand it during recommendation generation

    logger.info("Translation complete.")
    return result