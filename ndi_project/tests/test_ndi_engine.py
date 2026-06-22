import math

import pytest

from src.ndi_engine import calculate_ndi


def test_high_quality_features_produce_low_ndi() -> None:
    result = calculate_ndi(
        {
            "local_coherence": 90.0,
            "global_coherence": 90.0,
            "story_grammar_score": 100.0,
            "speech_rate": 120.0,
            "avg_pause_duration": 0.2,
        }
    )
    assert result["ndi_score"] < 20
    assert result["risk_level"] == "Healthy"


def test_low_quality_features_produce_high_ndi() -> None:
    result = calculate_ndi(
        {
            "local_coherence": 10.0,
            "global_coherence": 10.0,
            "story_grammar_score": 0.0,
            "speech_rate": 20.0,
            "avg_pause_duration": 3.0,
        }
    )
    assert result["ndi_score"] >= 60
    assert result["risk_level"] == "High Risk"


def _uniform_quality_features(quality: float) -> dict[str, float]:
    return {
        "local_coherence": quality,
        "global_coherence": quality,
        "story_grammar_score": quality,
        "speech_rate": quality,
        "avg_pause_duration": 3.0 * (1.0 - quality / 100.0),
    }


@pytest.mark.parametrize(
    ("quality", "ndi", "risk"),
    [
        (100.0, 0.0, "Healthy"),
        (80.0, 20.0, "Mild Risk"),
        (60.0, 40.0, "Moderate Risk"),
        (40.0, 60.0, "High Risk"),
        (0.0, 100.0, "High Risk"),
    ],
)
def test_exact_risk_boundaries(quality: float, ndi: float, risk: str) -> None:
    result = calculate_ndi(_uniform_quality_features(quality))
    assert result["ndi_score"] == ndi
    assert result["risk_level"] == risk


@pytest.mark.parametrize("invalid", [math.nan, -math.nan])
def test_ndi_rejects_nan(invalid: float) -> None:
    features = _uniform_quality_features(80.0)
    features["local_coherence"] = invalid
    with pytest.raises(ValueError, match="Invalid NDI input: local_coherence contains NaN"):
        calculate_ndi(features)


@pytest.mark.parametrize("invalid", [math.inf, -math.inf])
def test_ndi_rejects_infinity(invalid: float) -> None:
    features = _uniform_quality_features(80.0)
    features["speech_rate"] = invalid
    with pytest.raises(ValueError, match="Invalid NDI input: speech_rate contains infinity"):
        calculate_ndi(features)


def test_ndi_rejects_non_numeric_input() -> None:
    features = _uniform_quality_features(80.0)
    features["global_coherence"] = "high"  # type: ignore[assignment]
    with pytest.raises(ValueError, match="Invalid NDI input: global_coherence is not numeric"):
        calculate_ndi(features)
