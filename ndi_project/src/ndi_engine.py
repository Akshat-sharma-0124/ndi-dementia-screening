"""Transparent weighted Narrative Degradation Index scoring."""

from __future__ import annotations

import math
from numbers import Real
from typing import Mapping

import numpy as np

WEIGHTS = {
    "local_coherence": 0.25,
    "global_coherence": 0.25,
    "story_grammar_score": 0.20,
    "speech_rate": 0.15,
    "avg_pause_duration": 0.15,
}


def _bounded(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return float(np.clip(value, low, high))


def _speech_rate_quality(words_per_minute: float) -> float:
    """Trapezoidal fluency score: best at 100-160 WPM, penalizing extremes."""
    rate = max(0.0, words_per_minute)
    if rate < 100.0:
        return _bounded(rate)
    if rate <= 160.0:
        return 100.0
    return _bounded(100.0 - (rate - 160.0) * 1.25)


def _pause_quality(seconds: float) -> float:
    """Map average internal pause duration to quality; >=3 seconds maps to zero."""
    return _bounded(100.0 * (1.0 - max(0.0, seconds) / 3.0))


def calculate_ndi(features: Mapping[str, float]) -> dict[str, float | str]:
    """Calculate quality, NDI (100-quality), and a transparent risk band."""
    missing = [name for name in WEIGHTS if name not in features]
    if missing:
        raise ValueError(f"Cannot calculate NDI; missing features: {missing}")
    validated: dict[str, float] = {}
    for name in WEIGHTS:
        value = features[name]
        if not isinstance(value, Real) or isinstance(value, bool):
            raise ValueError(f"Invalid NDI input: {name} is not numeric")
        numeric = float(value)
        if math.isnan(numeric):
            raise ValueError(f"Invalid NDI input: {name} contains NaN")
        if math.isinf(numeric):
            raise ValueError(f"Invalid NDI input: {name} contains infinity")
        validated[name] = numeric
    normalized = {
        "local_coherence": _bounded(validated["local_coherence"]),
        "global_coherence": _bounded(validated["global_coherence"]),
        "story_grammar_score": _bounded(validated["story_grammar_score"]),
        "speech_rate": _speech_rate_quality(validated["speech_rate"]),
        "avg_pause_duration": _pause_quality(validated["avg_pause_duration"]),
    }
    quality = sum(normalized[name] * weight for name, weight in WEIGHTS.items())
    ndi = round(_bounded(100.0 - quality), 2)
    if ndi < 20.0:
        risk = "Healthy"
    elif ndi < 40.0:
        risk = "Mild Risk"
    elif ndi < 60.0:
        risk = "Moderate Risk"
    else:
        risk = "High Risk"
    return {"quality_score": round(quality, 2), "ndi_score": ndi, "risk_level": risk}
