"""Audio transcription using Faster-Whisper."""

from __future__ import annotations

import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


@lru_cache(maxsize=2)
def _load_model(model_size: str, device: str, compute_type: str) -> Any:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:  # pragma: no cover - dependency error
        raise RuntimeError("Install project dependencies to use Faster-Whisper.") from exc
    return WhisperModel(
        model_size, 
        device=device, 
        compute_type=compute_type,
        cpu_threads=1,
        num_workers=1
    )


def transcribe_audio(
    audio_path: str | Path,
    model_size: str = "tiny.en",
    device: str | None = None,
    compute_type: str | None = None,
) -> str:
    """Transcribe an audio file and return whitespace-normalized English text."""
    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file not found: {path}")

    resolved_device = device or os.getenv("NDI_WHISPER_DEVICE", "cpu")
    resolved_compute = compute_type or os.getenv("NDI_WHISPER_COMPUTE_TYPE", "int8")
    model = _load_model(model_size, resolved_device, resolved_compute)
    segments, _ = model.transcribe(
        str(path),
        language="en",
        beam_size=1,
        vad_filter=True,
        condition_on_previous_text=True,
    )
    transcript = " ".join(segment.text.strip() for segment in segments)
    return re.sub(r"\s+", " ", transcript).strip()

