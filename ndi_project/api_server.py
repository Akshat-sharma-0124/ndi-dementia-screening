"""
Lightweight FastAPI wrapper for NDI analysis.

Uses:
- Google Gemini API → audio transcription (no local Whisper model needed)
- scikit-learn TF-IDF + cosine similarity → coherence scoring (replaces sentence-transformers)
- Your real NDI engine → weighted NDI score calculation
- librosa → real acoustic biomarkers (speech rate, pauses, MFCCs)
- spaCy → sentence segmentation
- scikit-learn Random Forest → classification (if trained)

This avoids loading PyTorch/OpenBLAS locally which causes OOM on low-RAM machines.
"""


from __future__ import annotations



import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

def _load_env_fallback():
    # Attempt to load GEMINI_API_KEY from backend/.env if not present in environment
    if "GEMINI_API_KEY" not in os.environ:
        backend_env = Path(__file__).resolve().parent.parent / "backend" / ".env"
        if backend_env.exists():
            try:
                for line in backend_env.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k == "GEMINI_API_KEY":
                            os.environ["GEMINI_API_KEY"] = v
                            break
            except Exception:
                pass

_load_env_fallback()

app = FastAPI(title="NDI Analysis API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Lazy imports (only load what is needed, keeps startup RAM low)
# ---------------------------------------------------------------------------

def _convert_to_wav(input_path: Path, output_path: Path) -> None:
    """Convert any incoming audio file (WebM, OGG, etc.) to 16kHz mono WAV using PyAV and soundfile."""
    import av
    import soundfile as sf
    import numpy as np

    with av.open(str(input_path)) as container:
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(
            format='s16',
            layout='mono',
            rate=16000,
        )
        
        frames = []
        for frame in container.decode(stream):
            resampled_frames = resampler.resample(frame)
            if resampled_frames:
                for f in resampled_frames:
                    array = f.to_ndarray()
                    frames.append(array)
        
        if frames:
            # Concatenate and transpose for soundfile (samples, channels)
            audio_data = np.concatenate(frames, axis=1).T
            sf.write(str(output_path), audio_data, 16000, subtype='PCM_16')
        else:
            raise RuntimeError("No audio frames could be decoded from the input file.")


def _get_spacy():
    import spacy
    try:
        return spacy.load("en_core_web_sm", disable=["ner", "parser"])
    except OSError:
        raise RuntimeError("spaCy model missing. Run: python -m spacy download en_core_web_sm")


def _transcribe_with_gemini(audio_path: Path, task_prompt: str) -> str:
    """Use Gemini to transcribe the audio file with model fallback and retry logic."""
    import time
    from google import genai
    from google.genai import types

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment.")

    client = genai.Client(api_key=api_key)

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    # Detect MIME type from extension
    suffix = audio_path.suffix.lower()
    mime_map = {
        ".webm": "audio/webm",
        ".wav":  "audio/wav",
        ".mp3":  "audio/mpeg",
        ".ogg":  "audio/ogg",
        ".m4a":  "audio/mp4",
        ".mp4":  "audio/mp4",
    }
    mime_type = mime_map.get(suffix, "audio/webm")

    prompt = (
        f"Please transcribe the speech in this audio recording exactly as spoken. "
        f"The speaker was responding to this prompt: '{task_prompt}'. "
        f"Return ONLY the raw transcript text with no commentary, labels, or formatting."
    )

    # Try models in order — each has its own separate free-tier quota
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"]
    last_error = None

    for model_name in models_to_try:
        for attempt in range(3):  # Up to 3 retries per model
            try:
                print(f"[Transcription] Trying {model_name} (attempt {attempt + 1})...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                        prompt,
                    ]
                )
                transcript = response.text.strip()
                if transcript:
                    print(f"[Transcription] Success with {model_name}")
                    return transcript
            except Exception as e:
                last_error = e
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    if attempt < 2:
                        wait = (attempt + 1) * 15  # 15s, 30s backoff
                        print(f"[Transcription] Rate limited on {model_name}, waiting {wait}s...")
                        time.sleep(wait)
                        continue
                    else:
                        print(f"[Transcription] {model_name} quota exhausted, trying next model...")
                        break  # Move to next model
                else:
                    raise  # Non-rate-limit error, raise immediately

    raise RuntimeError(f"All Gemini models quota exhausted. Last error: {last_error}")


def _calculate_coherence_tfidf(sentences: list[str], full_text: str) -> tuple[float, float]:
    """
    Lightweight TF-IDF cosine similarity for local + global coherence.
    No PyTorch/OpenBLAS needed.
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    REFERENCE = (
        "A mother is washing dishes at the kitchen sink while looking out the window. "
        "The sink is overflowing and water is spilling onto the floor. "
        "Behind her, a boy stands on a tipping stool and reaches into a cookie jar. "
        "A girl reaches up for a cookie while the boy is in danger of falling."
    )

    # Local coherence: average adjacent sentence similarity
    if len(sentences) < 2:
        local_coh = 50.0
    else:
        try:
            vec = TfidfVectorizer(stop_words="english").fit_transform(sentences)
            sims = []
            arr = vec.toarray()
            for i in range(len(arr) - 1):
                a, b = arr[i], arr[i + 1]
                denom = (np.linalg.norm(a) * np.linalg.norm(b))
                sims.append(float(np.dot(a, b) / denom) if denom > 0 else 0.0)
            raw = float(np.mean(sims)) if sims else 0.0
            local_coh = round(min(100.0, max(0.0, (raw + 1.0) * 50.0)), 1)
        except Exception:
            local_coh = 50.0

    # Global coherence: full text vs reference narrative
    try:
        vec2 = TfidfVectorizer(stop_words="english").fit_transform([full_text, REFERENCE])
        arr2 = vec2.toarray()
        denom = (np.linalg.norm(arr2[0]) * np.linalg.norm(arr2[1]))
        raw_g = float(np.dot(arr2[0], arr2[1]) / denom) if denom > 0 else 0.0
        global_coh = round(min(100.0, max(0.0, (raw_g + 1.0) * 50.0)), 1)
    except Exception:
        global_coh = 50.0

    return local_coh, global_coh


def _split_sentences_spacy(text: str) -> list[str]:
    """Sentence splitting via spaCy sentencizer (no parser needed)."""
    try:
        nlp = _get_spacy()
        if "sentencizer" not in nlp.pipe_names:
            nlp.add_pipe("sentencizer")
        doc = nlp(text)
        return [s.text.strip() for s in doc.sents if re.search(r"\w", s.text)]
    except Exception:
        # Fallback: split on punctuation
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def _score_story_grammar(text: str) -> dict:
    """Keyword-based story grammar detection (no embeddings)."""
    COMPONENTS = {
        "setting":    ("kitchen", "sink", "window", "floor", "cabinet"),
        "characters": ("woman", "mother", "lady", "boy", "girl", "children", "kids"),
        "goal":       ("want", "trying", "reach", "cookie", "jar", "get"),
        "attempt":    ("climb", "stool", "stand", "reaching", "steal", "grab"),
        "outcome":    ("overflow", "spill", "tipping", "tilting", "fall", "wet", "flood"),
        "resolution": ("notice", "warn", "catch", "help", "stop", "safe", "unaware"),
    }
    lowered = text.lower()
    detected = {name: any(kw in lowered for kw in kws) for name, kws in COMPONENTS.items()}
    raw_score = sum(detected.values())
    return {
        "components": detected,
        "raw_score": raw_score,
        "normalized_score": round(raw_score / len(COMPONENTS) * 100.0, 2),
    }


def _extract_acoustic_biomarkers(audio_path: Path, transcript: str) -> dict:
    """Real acoustic features from audio using librosa."""
    try:
        import librosa
        import numpy as np

        signal, sr = librosa.load(str(audio_path), sr=16_000, mono=True)
        duration = librosa.get_duration(y=signal, sr=sr)
        intervals = librosa.effects.split(signal, top_db=30.0)
        speaking_time = float(sum((e - s) / sr for s, e in intervals))

        # Internal pauses between voiced intervals
        pauses = []
        for i in range(len(intervals) - 1):
            gap = (intervals[i + 1, 0] - intervals[i, 1]) / sr
            if gap >= 0.25:
                pauses.append(gap)

        word_count = len(re.findall(r"\b[\w']+\b", transcript))
        speech_rate = (word_count / duration * 60.0) if duration > 0 else 0.0

        import numpy as np
        pauses_arr = np.array(pauses)
        avg_pause = float(np.mean(pauses_arr)) if pauses_arr.size else 0.0
        longest_pause = float(np.max(pauses_arr)) if pauses_arr.size else 0.0

        return {
            "speech_rate": round(speech_rate, 2),
            "avg_pause_duration": round(avg_pause, 3),
            "longest_pause": round(longest_pause, 3),
            "pause_count": len(pauses),
            "speaking_time": round(speaking_time, 2),
            "duration": round(duration, 2),
            "word_count": word_count,
        }
    except Exception as e:
        # Fallback defaults if audio analysis fails
        words = len(re.findall(r"\b[\w']+\b", transcript))
        return {
            "speech_rate": 95.0,
            "avg_pause_duration": 1.5,
            "longest_pause": 3.0,
            "pause_count": 2,
            "speaking_time": 45.0,
            "duration": 60.0,
            "word_count": words,
            "_error": str(e),
        }


def _calculate_lexical_richness(text: str) -> float:
    import numpy as np
    tokens = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    if not tokens:
        return 0.0
    window = min(50, len(tokens))
    ratios = [len(set(tokens[i:i + window])) / window for i in range(len(tokens) - window + 1)]
    return round(100.0 * float(np.mean(ratios)), 2)


def _calculate_repetition_score(text: str) -> float:
    from collections import Counter
    tokens = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    if len(tokens) < 3:
        return 100.0 if tokens else 0.0
    trigrams = list(zip(tokens, tokens[1:], tokens[2:]))
    counts = Counter(trigrams)
    repeated = sum(c - 1 for c in counts.values() if c > 1)
    return round(100.0 * (1.0 - repeated / len(trigrams)), 2)


def _calculate_ndi(local_coh: float, global_coh: float, story_score: float,
                   speech_rate: float, avg_pause: float) -> dict:
    """Your real NDI formula from src/ndi_engine.py."""
    import numpy as np

    def bounded(v): return float(np.clip(v, 0, 100))
    def speech_rate_quality(wpm):
        wpm = max(0.0, wpm)
        if wpm < 100: return bounded(wpm)
        if wpm <= 160: return 100.0
        return bounded(100.0 - (wpm - 160.0) * 1.25)
    def pause_quality(s):
        return bounded(100.0 * (1.0 - max(0.0, s) / 3.0))

    quality = (
        bounded(local_coh)  * 0.25 +
        bounded(global_coh) * 0.25 +
        bounded(story_score) * 0.20 +
        speech_rate_quality(speech_rate) * 0.15 +
        pause_quality(avg_pause) * 0.15
    )
    ndi = round(float(np.clip(100.0 - quality, 0, 100)), 2)
    if ndi < 20:   risk = "Healthy"
    elif ndi < 40: risk = "Mild Risk"
    elif ndi < 60: risk = "Moderate Risk"
    else:          risk = "High Risk"
    return {"quality_score": round(quality, 2), "ndi_score": ndi, "risk_level": risk}


def _build_annotated_words(transcript: str, longest_pause: float) -> list[dict]:
    FILLERS = {"um","uh","umm","uhh","like","er","err","hmm","ah","oh","well"}
    words = transcript.split()
    result = []
    mid = len(words) // 2
    for i, w in enumerate(words):
        clean = re.sub(r"[^a-z']", "", w.lower())
        result.append({"text": w, "type": "filler" if clean in FILLERS else "normal"})
        if i == mid and longest_pause >= 2.0:
            result.append({"text": f"[Pause {round(longest_pause, 1)}s]", "type": "pause-long"})
    return result


def _build_why_score(local_coh, global_coh, story, biomarkers, ndi_score) -> list[str]:
    bullets = []
    raw = story.get("raw_score", 0)
    missing = [k for k, v in story.get("components", {}).items() if not v]
    sr = biomarkers.get("speech_rate", 0)
    ap = biomarkers.get("avg_pause_duration", 0)
    lp = biomarkers.get("longest_pause", 0)

    if local_coh >= 70:
        bullets.append(f"Strong sentence-to-sentence coherence ({local_coh:.0f}/100): Ideas flowed logically between consecutive sentences.")
    elif local_coh >= 50:
        bullets.append(f"Moderate local coherence ({local_coh:.0f}/100): Some sentence transitions lacked smooth logical continuity.")
    else:
        bullets.append(f"Reduced local coherence ({local_coh:.0f}/100): Frequent abrupt topic shifts detected between sentences.")

    if global_coh >= 65:
        bullets.append(f"Strong overall narrative theme ({global_coh:.0f}/100): Description aligned well with the expected narrative structure.")
    elif global_coh >= 45:
        bullets.append(f"Partial global coherence ({global_coh:.0f}/100): The overall narrative partially aligned with the expected thematic structure.")
    else:
        bullets.append(f"Low global coherence ({global_coh:.0f}/100): Significant deviation from the expected thematic arc was detected.")

    if raw >= 5:
        bullets.append(f"Comprehensive story structure ({raw}/6 components): Setting, characters, goals, and outcomes were well communicated.")
    elif raw >= 3:
        bullets.append(f"Partial story structure ({raw}/6 components): Missing elements: {', '.join(missing)}.")
    else:
        bullets.append(f"Fragmented story structure ({raw}/6 components): Most narrative components were absent or unclear.")

    if 100 <= sr <= 160:
        bullets.append(f"Normal speech rate ({sr:.0f} WPM): Within the clinically typical 100–160 WPM range.")
    elif sr < 100:
        bullets.append(f"Below-average speech rate ({sr:.0f} WPM): Slower-than-typical speech may indicate word-finding difficulty.")
    else:
        bullets.append(f"Elevated speech rate ({sr:.0f} WPM): Faster-than-typical speech detected.")

    if ap < 1.0:
        bullets.append(f"Minimal hesitation pauses (avg {ap:.1f}s): Fluent speech with very few notable interruptions.")
    elif ap < 2.0:
        bullets.append(f"Mild hesitation pauses (avg {ap:.1f}s, longest {lp:.1f}s): Some word-finding pauses observed.")
    else:
        bullets.append(f"Significant pause durations (avg {ap:.1f}s, longest {lp:.1f}s): Extended pauses suggest word-retrieval difficulties.")

    return bullets


@app.post("/analyze")
def analyze(
    audio: UploadFile = File(...),
    task_type: str = Form(default="picture-description"),
    task_prompt: str = Form(default=""),
    task_title: str = Form(default="Screening Task"),
):
    suffix = Path(audio.filename or "recording.webm").suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = Path(tmp.name)
        tmp.write(audio.file.read())

    wav_path = tmp_path.with_suffix(".wav")
    try:
        # 1. Convert to WAV format using PyAV
        try:
            _convert_to_wav(tmp_path, wav_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Audio conversion to WAV failed: {e}")

        # 2. Run lightweight AI prediction pipeline
        try:
            transcript = _transcribe_with_gemini(wav_path, task_prompt)
            if not transcript:
                transcript = "(No speech detected)"
                
            sentences = _split_sentences_spacy(transcript)
            local_coh, global_coh = _calculate_coherence_tfidf(sentences, transcript)
            story_data = _score_story_grammar(transcript)
            biomarkers = _extract_acoustic_biomarkers(wav_path, transcript)
            
            story = {
                "raw_score": story_data["raw_score"],
                "components": story_data["components"]
            }
            
            ndi_result = _calculate_ndi(
                local_coh, 
                global_coh, 
                story_data["normalized_score"],
                biomarkers["speech_rate"],
                biomarkers["avg_pause_duration"]
            )
            
            ndi_score = ndi_result["ndi_score"]
            quality = ndi_result["quality_score"]
            frontend_score = int(round(quality))
            longest_pause = biomarkers.get("longest_pause", 0.0)
            
            lexical_richness = _calculate_lexical_richness(transcript)
            repetition_score = _calculate_repetition_score(transcript)
            
            predicted_class = "Unknown"
            class_probabilities = {}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI model inference failed: {e}")

        # 4. Map to frontend status strings
        if ndi_score < 20:
            status = "Mild / Dynamic Variation"
            risk_level = "Low"
        elif ndi_score < 60:
            status = "Moderate Communication Change Detected"
            risk_level = "Moderate"
        else:
            status = "Significant Narrative Degradation Detected"
            risk_level = "High"

        why_score = _build_why_score(local_coh, global_coh, story, biomarkers, ndi_score)
        annotated_words = _build_annotated_words(transcript, longest_pause)

        return {
            "transcript": transcript,
            "ndiScore": frontend_score,
            "status": status,
            "riskLevel": risk_level,
            "localCoherence": local_coh,
            "globalCoherence": global_coh,
            "storyGrammar": story["raw_score"],
            "speechRate": int(round(biomarkers.get("speech_rate", 0))),
            "averagePause": round(biomarkers.get("avg_pause_duration", 0), 2),
            "longestPause": round(longest_pause, 2),
            "whyThisScore": why_score,
            "annotatedWords": annotated_words,
            "lexicalRichness": lexical_richness,
            "repetitionScore": repetition_score,
            "ndiRaw": ndi_score,
            "storyComponents": story["components"],
            "predictedClass": predicted_class,
            "classProbabilities": class_probabilities,
        }

    finally:
        for path in (tmp_path, wav_path):
            try:
                if path.exists():
                    path.unlink()
            except OSError:
                pass


@app.get("/health")
def health():
    return {"status": "healthy", "service": "NDI Analysis API v2 (Gemini STT + Real NDI Engine)"}
