"""Shared configuration and feature schema."""

from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
MODEL_DIR = PROJECT_ROOT / "models"
OUTPUT_DIR = PROJECT_ROOT / "outputs"
MODEL_PATH = MODEL_DIR / "rf_model.pkl"

CLASS_NAMES = (
    "Healthy",
    "Mild Cognitive Impairment",
    "Moderate Dementia",
    "Severe Dementia",
)

FOLDER_TO_CLASS = {
    "healthy": CLASS_NAMES[0],
    "mci": CLASS_NAMES[1],
    "moderate": CLASS_NAMES[2],
    "severe": CLASS_NAMES[3],
}

N_MFCC = 13
NARRATIVE_FEATURES = [
    "local_coherence",
    "global_coherence",
    "story_grammar_score",
    "lexical_richness",
    "repetition_score",
]
AUDIO_SCALAR_FEATURES = [
    "speech_rate",
    "pause_count",
    "avg_pause_duration",
    "longest_pause",
    "speaking_time",
    "silence_ratio",
    "pitch_mean",
    "pitch_std",
    "pitch_min",
    "pitch_max",
    "voiced_fraction",
]
MFCC_FEATURES = [
    *[f"mfcc_{index:02d}_mean" for index in range(1, N_MFCC + 1)],
    *[f"mfcc_{index:02d}_std" for index in range(1, N_MFCC + 1)],
]
FEATURE_NAMES = NARRATIVE_FEATURES + AUDIO_SCALAR_FEATURES + MFCC_FEATURES
