"""End-to-end feature extraction with a stable model input schema."""

from __future__ import annotations

from pathlib import Path
from typing import Mapping

import numpy as np

from .config import FEATURE_NAMES
from .narrative_analysis import analyze_narrative
from .speech_biomarkers import extract_speech_biomarkers
from .story_grammar import score_story_grammar


def extract_features(
    audio_path: str | Path,
    transcript: str,
    story_grammar: Mapping[str, object] | None = None,
) -> dict[str, float]:
    """Combine transcript-derived and real-audio features."""
    narrative = analyze_narrative(transcript)
    story = story_grammar if story_grammar is not None else score_story_grammar(transcript)
    if "normalized_score" not in story:
        raise ValueError("Story grammar result is missing normalized_score.")
    audio = extract_speech_biomarkers(audio_path, transcript)
    features = {
        **narrative,
        "story_grammar_score": float(story["normalized_score"]),
        **audio,
    }
    missing = set(FEATURE_NAMES) - features.keys()
    if missing:
        raise RuntimeError(f"Feature extraction omitted required fields: {sorted(missing)}")
    return {name: float(features[name]) for name in FEATURE_NAMES}


def feature_vector(features: Mapping[str, float]) -> np.ndarray:
    """Convert named features to a 2-D vector in the canonical order."""
    missing = [name for name in FEATURE_NAMES if name not in features]
    if missing:
        raise ValueError(f"Missing model features: {missing}")
    vector = np.asarray([[features[name] for name in FEATURE_NAMES]], dtype=np.float64)
    # NaN is valid for unmeasurable pitch and is handled by the fitted imputer.
    # Infinity is never a meaningful measurement and must be rejected.
    if np.any(np.isinf(vector)):
        raise ValueError("Feature vector contains infinite values.")
    return vector
