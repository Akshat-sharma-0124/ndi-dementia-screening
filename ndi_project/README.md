# Narrative Degradation Index (NDI)

NDI is an end-to-end academic prototype that analyzes a real WAV recording of a
patient describing the Cookie Theft picture. It transcribes speech, measures narrative
organization and acoustic fluency, computes an interpretable degradation index, and—
after training on real labeled audio—predicts one of four severity classes.

> **Not a medical device:** this software is not clinically validated and must not be
> used for diagnosis, treatment, triage, or other clinical decisions.

## Pipeline

```text
WAV → Faster-Whisper → transcript ─┬→ coherence, story grammar,
                                   │  lexical richness, repetition
                                   └→ audio timing, MFCC, pitch
                                                ↓
                                      ordered feature vector
                                       ├→ weighted NDI
                                       └→ Random Forest class
```

The classifier never trains on raw transcript text. The text is used only to calculate
numeric cognitive-linguistic features. Acoustic features always come from real audio;
the project does not simulate them or infer them from punctuation/filler words.

## Setup

Python 3.10–3.12 and FFmpeg are recommended. From this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The English spaCy wheel is included in `requirements.txt`. If it was omitted by an
environment-specific installer, run `python -m spacy download en_core_web_sm`.
Faster-Whisper and Sentence Transformers download `base.en` and
`all-mpnet-base-v2` on first use. CPU inference defaults to `int8`; CUDA users can set:

```powershell
$env:NDI_WHISPER_DEVICE = "cuda"
$env:NDI_WHISPER_COMPUTE_TYPE = "float16"
```

## Data and training

Add real WAV files beneath the label folders:

```text
data/healthy/*.wav
data/mci/*.wav
data/moderate/*.wav
data/severe/*.wav
```

At least two recordings per class are required by the code, though a meaningful study
needs substantially more independent participants. Then run:

```powershell
python -m src.train_classifier
```

The script transcribes every WAV, extracts only numeric features, performs a stratified
80/20 split (rounded so every class appears in the test set), reports weighted
precision/recall/F1 and accuracy, saves a confusion matrix and feature audit CSV under
`outputs/`, and writes `models/rf_model.pkl`.

With no WAV files, training exits with a clear message and creates no model. This is the
intended state for the supplied 40 text-only transcripts: using fabricated pause or
pitch values would invalidate the experiment.

## Predict one patient

```powershell
python -m src.predict audio/patient.wav --output outputs/patient.json
```

If the Random Forest has not been trained, all deterministic features and the NDI are
still returned, while `predicted_class` is `"Model not trained"`.

## Streamlit demo

```powershell
streamlit run app/streamlit_app.py
```

Upload a WAV to view the transcript, NDI/risk gauge, narrative scores, detected story
components, acoustic biomarkers, and class probabilities (when a model exists).

## NDI definition

The quality score uses local coherence (25%), global coherence (25%), normalized story
grammar (20%), speech-rate quality (15%), and pause-duration quality (15%). Coherence
and story inputs are already 0–100. Speech rate receives full quality from 100–160 WPM
and is penalized outside that range. WPM uses full recording duration (including
pauses). Average internal pauses linearly decline from full
quality at 0 seconds to zero at 3 seconds. `NDI = 100 - quality`.

Risk bands are `[0,20)` Healthy, `[20,40)` Mild Risk, `[40,60)` Moderate Risk, and
`[60,100]` High Risk. These thresholds are design assumptions, not clinical cutoffs.

## Files

- `src/config.py` — paths, labels, and the canonical ordered feature schema.
- `src/speech_to_text.py` — cached Faster-Whisper `base.en` transcription.
- `src/narrative_analysis.py` — spaCy segmentation, MPNet embeddings, coherence,
  MATTR lexical richness, and trigram non-repetition.
- `src/story_grammar.py` — keyword plus semantic detection of six story components.
- `src/speech_biomarkers.py` — real-audio WPM, pauses, speaking time, silence ratio,
  13 MFCC means/stds, and pYIN pitch statistics.
- `src/feature_extraction.py` — combines features and enforces schema/order.
- `src/ndi_engine.py` — transparent weighted NDI and risk bands.
- `src/train_classifier.py` — labeled-audio discovery, extraction, split, Random Forest,
  metrics, confusion matrix, and model persistence.
- `src/predict.py` — the requested `predict_patient(audio_path)` pipeline and JSON CLI.
- `app/streamlit_app.py` — WAV upload and visual analysis UI.
- `tests/` — fast unit tests that do not download neural models.
- `data/`, `audio/`, `transcripts/`, `models/`, `outputs/` — dataset and artifact areas,
  each documented locally.
- `requirements.txt` and `pyproject.toml` — runtime/development dependencies and tooling.

## Methodological limitations

The provided transcript set appears templated and contains no participant/audio timing
information, so it is unsuitable for evaluating the full model. The current split is
sample-stratified; research with repeated recordings should use group-aware splitting
by participant to prevent leakage. The reference narrative, semantic thresholds, NDI
weights, pause threshold, and risk bands require preregistration and external validation
before any scientific claims. Speech rate depends on ASR word count, and microphone,
room acoustics, accent, language, motor speech, and hearing can confound measurements.

Run lightweight checks with:

```powershell
pytest -q
ruff check .
```
