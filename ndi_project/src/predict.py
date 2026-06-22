"""Single-patient NDI inference pipeline."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Literal

import joblib
import numpy as np

from .config import FEATURE_NAMES, MODEL_PATH
from .feature_extraction import extract_features, feature_vector
from .ndi_engine import calculate_ndi
from .speech_to_text import transcribe_audio
from .story_grammar import score_story_grammar

HealthClassification = Literal["Healthy", "MCI", "Moderate", "Severe"]


def _validate_model_bundle(bundle: object) -> dict[str, Any]:
    """Validate persisted model structure before invoking deserialized objects."""
    if not isinstance(bundle, dict):
        raise RuntimeError("Malformed model bundle: expected a dictionary.")
    required = ("feature_names", "model", "classes", "metrics", "version")
    missing = [name for name in required if name not in bundle]
    if missing:
        raise RuntimeError(f"Malformed model bundle: missing fields {missing}.")
    if bundle["feature_names"] != FEATURE_NAMES:
        raise RuntimeError("Saved model feature schema is incompatible with this code version.")
    model = bundle["model"]
    if not callable(getattr(model, "predict", None)) or not callable(
        getattr(model, "predict_proba", None)
    ):
        raise RuntimeError("Malformed model bundle: model lacks prediction methods.")
    classes = bundle["classes"]
    if not isinstance(classes, (list, tuple)) or not classes or not all(
        isinstance(label, str) and label for label in classes
    ):
        raise RuntimeError("Malformed model bundle: classes must be a non-empty string list.")
    model_classes = getattr(model, "classes_", None)
    if model_classes is None or list(model_classes) != list(classes):
        raise RuntimeError("Malformed model bundle: classes do not match the fitted model.")
    if not isinstance(bundle["metrics"], dict):
        raise RuntimeError("Malformed model bundle: metrics must be a dictionary.")
    if not isinstance(bundle["version"], str) or not bundle["version"].strip():
        raise RuntimeError("Malformed model bundle: version must be a non-empty string.")
    return bundle


def _predict_class(features: dict[str, float], model_path: Path) -> tuple[str, dict[str, float]]:
    if not model_path.is_file():
        return "Model not trained", {}
    bundle = _validate_model_bundle(joblib.load(model_path))
    model = bundle["model"]
    vector = feature_vector(features)
    predicted = str(model.predict(vector)[0])
    raw_probabilities = model.predict_proba(vector)[0]
    if not np.all(np.isfinite(raw_probabilities)):
        raise RuntimeError("Model returned non-finite class probabilities.")
    probabilities = {
        str(label): round(float(probability), 4)
        for label, probability in zip(model.classes_, raw_probabilities)
    }
    return predicted, probabilities


def _classify_health(health_score: float) -> HealthClassification:
    if health_score >= 61:
        return "Healthy"
    if health_score >= 50:
        return "MCI"
    if health_score >= 35:
        return "Moderate"
    return "Severe"


def predict_patient(
    audio_path: str | Path,
    model_path: str | Path = MODEL_PATH,
) -> dict[str, Any]:
    """Run transcription, feature extraction, NDI scoring, and RF prediction."""
    path = Path(audio_path)
    transcript = transcribe_audio(path)
    if not transcript:
        raise ValueError("Faster-Whisper returned an empty transcript.")
    story = score_story_grammar(transcript)
    features = extract_features(path, transcript, story_grammar=story)
    ndi = calculate_ndi(features)
    predicted_class, probabilities = _predict_class(features, Path(model_path))
    biomarkers = {
        key: value
        for key, value in features.items()
        if key not in {
            "local_coherence",
            "global_coherence",
            "story_grammar_score",
            "lexical_richness",
            "repetition_score",
        }
    }
    health_score = ndi["quality_score"]
    classification = _classify_health(health_score)
    return {
        "transcript": transcript,
        "local_coherence": features["local_coherence"],
        "global_coherence": features["global_coherence"],
        "story_grammar_score": features["story_grammar_score"],
        "story_grammar_raw_score": story["raw_score"],
        "story_grammar_components": story["components"],
        "lexical_richness": features["lexical_richness"],
        "repetition_score": features["repetition_score"],
        "speech_rate": features["speech_rate"],
        "avg_pause_duration": features["avg_pause_duration"],
        "speech_biomarkers": biomarkers,
        **ndi,
        "health_score": health_score,
        "classification": classification,
        "predicted_class": predicted_class,
        "class_probabilities": probabilities,
        "disclaimer": "Academic prototype only; not a clinical diagnostic system.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio_path", type=Path)
    parser.add_argument("--model-path", type=Path, default=MODEL_PATH)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = predict_patient(args.audio_path, args.model_path)
    output = json.dumps(result, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
