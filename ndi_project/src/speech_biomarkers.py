"""Acoustic and fluency biomarkers extracted directly from real audio."""

from __future__ import annotations

import re
from pathlib import Path

import librosa
import numpy as np

from .config import N_MFCC


def _finite_stat(values: np.ndarray, function: str) -> float:
    finite = values[np.isfinite(values)]
    if not finite.size:
        return float("nan")
    return float(getattr(np, function)(finite))


def extract_speech_biomarkers(
    audio_path: str | Path,
    transcript: str,
    top_db: float = 30.0,
    min_pause_duration: float = 0.25,
) -> dict[str, float]:
    """Extract timing, MFCC, and pitch measurements from an audio file.

    Pauses are internal silent gaps between voiced intervals. Leading/trailing
    silence contributes to silence_ratio but is not counted as a hesitation.
    """
    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file not found: {path}")
    signal, sample_rate = librosa.load(path, sr=16_000, mono=True)
    if signal.size == 0:
        raise ValueError(f"Audio file is empty: {path}")

    duration = librosa.get_duration(y=signal, sr=sample_rate)
    intervals = librosa.effects.split(signal, top_db=top_db)
    speaking_time = float(sum((end - start) / sample_rate for start, end in intervals))
    pause_durations = [
        (intervals[index + 1, 0] - intervals[index, 1]) / sample_rate
        for index in range(max(0, len(intervals) - 1))
    ]
    pauses = np.asarray(
        [pause for pause in pause_durations if pause >= min_pause_duration], dtype=float
    )
    word_count = len(re.findall(r"\b[\w']+\b", transcript))
    # WPM conventionally includes pauses; speaking_time is reported separately and
    # can be used to derive articulation rate when a study protocol requires it.
    speech_rate = (word_count / duration * 60.0) if duration > 0 else 0.0

    mfcc = librosa.feature.mfcc(y=signal, sr=sample_rate, n_mfcc=N_MFCC)
    pitch, _, _ = librosa.pyin(
        signal,
        fmin=float(librosa.note_to_hz("C2")),
        fmax=float(librosa.note_to_hz("C7")),
        sr=sample_rate,
    )
    voiced_fraction = float(np.count_nonzero(np.isfinite(pitch)) / pitch.size) if pitch.size else 0.0
    result: dict[str, float] = {
        "speech_rate": round(speech_rate, 4),
        "pause_count": float(pauses.size),
        "avg_pause_duration": round(float(np.mean(pauses)) if pauses.size else 0.0, 4),
        "longest_pause": round(float(np.max(pauses)) if pauses.size else 0.0, 4),
        "speaking_time": round(speaking_time, 4),
        "silence_ratio": round(float(np.clip(1.0 - speaking_time / duration, 0.0, 1.0)), 4),
        "pitch_mean": round(_finite_stat(pitch, "mean"), 4),
        "pitch_std": round(_finite_stat(pitch, "std"), 4),
        "pitch_min": round(_finite_stat(pitch, "min"), 4),
        "pitch_max": round(_finite_stat(pitch, "max"), 4),
        "voiced_fraction": round(voiced_fraction, 4),
    }
    for index in range(N_MFCC):
        result[f"mfcc_{index + 1:02d}_mean"] = round(float(np.mean(mfcc[index])), 4)
        result[f"mfcc_{index + 1:02d}_std"] = round(float(np.std(mfcc[index])), 4)
    return result
