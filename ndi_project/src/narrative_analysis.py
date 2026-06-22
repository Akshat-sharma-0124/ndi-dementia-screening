"""Sentence segmentation and semantic narrative measurements."""

from __future__ import annotations

import re
from collections import Counter
from functools import lru_cache
from typing import Any, Sequence

import numpy as np

REFERENCE_NARRATIVE = (
    "A mother is washing dishes at the kitchen sink while looking out the window. "
    "The sink is overflowing and water is spilling onto the floor. "
    "Behind her, a boy stands on a tipping stool and reaches into a cookie jar. "
    "A girl reaches up for a cookie while the boy is in danger of falling. "
    "The mother does not notice either problem."
)


@lru_cache(maxsize=1)
def _get_nlp() -> Any:
    try:
        import spacy
    except ImportError as exc:
        raise RuntimeError("spaCy is required for narrative analysis.") from exc
    try:
        return spacy.load("en_core_web_sm", disable=["ner"])
    except OSError as exc:
        raise RuntimeError(
            "spaCy model missing. Run: python -m spacy download en_core_web_sm"
        ) from exc


@lru_cache(maxsize=1)
def _get_encoder() -> Any:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as exc:
        raise RuntimeError("sentence-transformers is required for embeddings.") from exc
    return SentenceTransformer("all-MiniLM-L6-v2")


def split_into_sentences(text: str) -> list[str]:
    """Segment text with spaCy, omitting empty and punctuation-only spans."""
    if not text or not text.strip():
        return []
    return [sent.text.strip() for sent in _get_nlp()(text).sents if re.search(r"\w", sent.text)]


def get_embeddings(sentences: Sequence[str]) -> np.ndarray:
    """Return L2-normalized MPNet embeddings for a sequence of texts."""
    if not sentences:
        return np.empty((0, 384), dtype=np.float32)
    return np.asarray(
        _get_encoder().encode(
            list(sentences), convert_to_numpy=True, normalize_embeddings=True
        ),
        dtype=np.float32,
    )


def _similarity_to_score(similarity: float) -> float:
    """Map cosine similarity [-1, 1] onto a bounded [0, 100] score."""
    return round(float(np.clip((similarity + 1.0) * 50.0, 0.0, 100.0)), 2)


def calculate_local_coherence(sentences: Sequence[str]) -> float:
    """Average cosine similarity between adjacent sentences on a 0-100 scale."""
    if not sentences:
        return 0.0
    if len(sentences) == 1:
        return 50.0
    embeddings = get_embeddings(sentences)
    similarities = np.sum(embeddings[:-1] * embeddings[1:], axis=1)
    return _similarity_to_score(float(np.mean(similarities)))


def calculate_global_coherence(text: str) -> float:
    """Compare the full description with a canonical Cookie Theft narrative."""
    if not text.strip():
        return 0.0
    embeddings = get_embeddings([text, REFERENCE_NARRATIVE])
    return _similarity_to_score(float(np.dot(embeddings[0], embeddings[1])))


def calculate_lexical_richness(text: str) -> float:
    """Compute moving-average type-token ratio (MATTR), returned as 0-100."""
    tokens = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    if not tokens:
        return 0.0
    window = min(50, len(tokens))
    ratios = [
        len(set(tokens[start : start + window])) / window
        for start in range(len(tokens) - window + 1)
    ]
    return round(100.0 * float(np.mean(ratios)), 2)


def calculate_repetition_score(text: str) -> float:
    """Return a 0-100 non-repetition score based on repeated content trigrams."""
    tokens = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    if len(tokens) < 3:
        return 100.0 if tokens else 0.0
    trigrams = list(zip(tokens, tokens[1:], tokens[2:]))
    counts = Counter(trigrams)
    repeated_occurrences = sum(count - 1 for count in counts.values() if count > 1)
    return round(100.0 * (1.0 - repeated_occurrences / len(trigrams)), 2)


def analyze_narrative(text: str) -> dict[str, float]:
    """Extract all cognitive-linguistic narrative features."""
    sentences = split_into_sentences(text)
    return {
        "local_coherence": calculate_local_coherence(sentences),
        "global_coherence": calculate_global_coherence(text),
        "lexical_richness": calculate_lexical_richness(text),
        "repetition_score": calculate_repetition_score(text),
    }

