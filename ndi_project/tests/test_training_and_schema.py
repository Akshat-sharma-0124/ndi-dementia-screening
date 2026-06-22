from pathlib import Path

import numpy as np
import pytest

from src.config import (
    AUDIO_SCALAR_FEATURES,
    FEATURE_NAMES,
    FOLDER_TO_CLASS,
    MFCC_FEATURES,
    NARRATIVE_FEATURES,
)
from src.feature_extraction import extract_features, feature_vector
from src.train_classifier import discover_audio


def test_wav_discovery_is_case_insensitive(tmp_path: Path) -> None:
    expected: set[Path] = set()
    spellings = ["patient.wav", "patient.WAV", "patient.Wav", "patient.wAv"]
    for folder in FOLDER_TO_CLASS:
        class_dir = tmp_path / folder
        class_dir.mkdir()
        for spelling in spellings:
            path = class_dir / spelling
            path.write_bytes(b"RIFF")
            expected.add(path)
        (class_dir / "ignore.mp3").write_bytes(b"not wav")

    discovered = discover_audio(tmp_path)
    assert {path for path, _ in discovered} == expected
    assert len(discovered) == len(expected)


def test_feature_schema_is_unique_complete_and_ordered(monkeypatch: pytest.MonkeyPatch) -> None:
    assert len(FEATURE_NAMES) == 42
    assert len(FEATURE_NAMES) == len(set(FEATURE_NAMES))
    assert FEATURE_NAMES == NARRATIVE_FEATURES + AUDIO_SCALAR_FEATURES + MFCC_FEATURES
    assert "voiced_fraction" in AUDIO_SCALAR_FEATURES

    narrative = {
        "local_coherence": 1.0,
        "global_coherence": 2.0,
        "lexical_richness": 3.0,
        "repetition_score": 4.0,
    }
    audio_names = AUDIO_SCALAR_FEATURES + MFCC_FEATURES
    audio = {name: float(index) for index, name in enumerate(audio_names)}
    monkeypatch.setattr("src.feature_extraction.analyze_narrative", lambda text: narrative)
    monkeypatch.setattr("src.feature_extraction.extract_speech_biomarkers", lambda path, text: audio)

    story = {"normalized_score": 50.0}
    features = extract_features("unused.wav", "text", story_grammar=story)
    assert list(features) == FEATURE_NAMES
    assert feature_vector(features).shape == (1, 42)


def test_feature_vector_allows_pitch_nan_but_rejects_infinity() -> None:
    features = {name: 1.0 for name in FEATURE_NAMES}
    features["pitch_mean"] = np.nan
    assert np.isnan(feature_vector(features)[0, FEATURE_NAMES.index("pitch_mean")])
    features["pitch_mean"] = np.inf
    with pytest.raises(ValueError, match="infinite"):
        feature_vector(features)
