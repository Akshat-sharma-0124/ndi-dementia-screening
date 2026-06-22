# NDI Technical Audit Report

**Audit date:** 2026-06-19  
**Scope:** Every Python file under `src/`, `app/`, and `tests/`, plus dependency declarations and every referenced project path.  
**Audit posture:** Code was treated as untrusted. Findings are based on line-by-line inspection, import/call-graph tracing, AST compilation, targeted test doubles, and an executable Random Forest smoke test.

## Executive conclusion

The project has a coherent modular design, no circular imports, and one consistent 41-feature schema. The finite-input NDI calculation is arithmetically correct. Faster-Whisper, SentenceTransformer, spaCy, scikit-learn, and Librosa calls are syntactically consistent with the declared APIs.

The project is **not yet production-quality and cannot be certified to run end-to-end without modification**. A confirmed Matplotlib backend failure aborts training during confusion-matrix generation in the audited Windows environment. The environment also lacks several declared dependencies, and no WAV data or trained model exists, so a genuine acoustic/neural end-to-end run was not possible. Additional correctness problems include NaN scores being labeled High Risk, over-permissive story-grammar detection, and duplicate semantic processing during every prediction.

## Verification evidence

| Check | Result | Evidence |
|---|---|---|
| Parse every Python file | Pass | All 13 Python files parsed successfully as UTF-8 ASTs. |
| Circular dependencies | Pass | Import graph is acyclic; see call graph below. |
| Feature schema | Pass | Exactly 41 unique features: 5 narrative + 10 acoustic scalars + 26 MFCC values. Extraction, training, model bundle, and prediction all use `config.FEATURE_NAMES`. |
| NDI finite-input arithmetic | Pass | Weights sum to 1.0. Independently calculated quality 80.0 returned NDI 20.0 and Mild Risk. |
| NDI non-finite handling | Fail | A NaN coherence value returned `quality_score=nan`, `ndi_score=nan`, and `risk_level="High Risk"`. |
| Random Forest mechanics | Conditional pass | With a synthetic numeric table and `MPLBACKEND=Agg`, 41-feature fit, 80/20 split, metrics, CSV, PNG, joblib save/reload, prediction, and probabilities all succeeded. This was execution testing only, not project-model training. |
| Random Forest default execution | Fail | Without forcing Agg, confusion-matrix creation raised `_tkinter.TclError` because Matplotlib selected Tk. |
| Faster-Whisper orchestration | Contract pass | A test double confirmed correct path, `language="en"`, `beam_size=5`, `vad_filter=True`, segment iteration, and transcript cleanup. Real model unavailable locally. |
| SentenceTransformer | Static pass only | `encode(..., convert_to_numpy=True, normalize_embeddings=True)` and `all-mpnet-base-v2` usage are structurally correct. Package/model unavailable locally. |
| Librosa | Static pass only | `load`, `effects.split`, `feature.mfcc`, `pyin`, and `note_to_hz` calls are structurally correct. Package unavailable locally. |
| Streamlit APIs | Partial pass | Installed Streamlit 1.56 accepts the used chart/progress/dataframe parameters. Full app import is blocked by missing Librosa; audio/neural flow was not executed. |
| TODOs/placeholders | Pass | No `TODO`, `FIXME`, `pass`, `NotImplemented`, or placeholder implementation was found. Intentional “Model not trained” behavior is not a placeholder. |
| Dead code | Pass with metadata note | No unreachable function was found. Bundle fields `classes`, `metrics`, and `version` are retained metadata but are not consumed by inference. |

### Audited environment

Installed and detected: Python 3.10, NumPy 2.2.6, pandas 2.3.3, scikit-learn 1.7.2, joblib 1.5.3, Matplotlib 3.10.9, Streamlit 1.56.0, spaCy 3.8.14, and `en_core_web_sm` 3.8.0.

Missing: `librosa`, `soundfile`, `sentence_transformers`, `faster_whisper`, `pytest`, and `ruff`. These are declared in `requirements.txt`, so this is primarily an environment state, but it prevents a true end-to-end certification. First-use downloads for Faster-Whisper and SentenceTransformer also require model-cache access or network access.

## Execution and dependency graph

```text
config
├── speech_biomarkers
│   └── feature_extraction
├── feature_extraction
│   ├── narrative_analysis
│   └── story_grammar ──> narrative_analysis
├── train_classifier
│   ├── speech_to_text
│   └── feature_extraction
└── predict
    ├── speech_to_text
    ├── feature_extraction
    ├── story_grammar
    └── ndi_engine

streamlit_app ──> predict
```

No module imports a downstream caller, so no circular dependency exists.

Training flow:

```text
data/{healthy,mci,moderate,severe}/**/*.wav
  -> discover_audio
  -> transcribe_audio
  -> extract_features
  -> 41-column numeric matrix
  -> stratified train_test_split
  -> SimpleImputer(median)
  -> RandomForestClassifier
  -> metrics/model/CSV/confusion-matrix artifacts
```

Inference flow:

```text
WAV -> transcribe_audio -> extract_features -> calculate_ndi
    -> feature_vector -> saved Pipeline.predict/predict_proba
    -> JSON-compatible result -> Streamlit display
```

## Feature-schema verification

`config.py` is the single source of truth:

- Narrative: `local_coherence`, `global_coherence`, `story_grammar_score`, `lexical_richness`, `repetition_score`.
- Acoustic scalar: `speech_rate`, `pause_count`, `avg_pause_duration`, `longest_pause`, `speaking_time`, `silence_ratio`, `pitch_mean`, `pitch_std`, `pitch_min`, `pitch_max`.
- MFCC: `mfcc_01_mean` through `mfcc_13_mean`, then `mfcc_01_std` through `mfcc_13_std`.

`feature_extraction.extract_features()` filters and orders output with this list. `train_classifier` indexes the DataFrame with the same list before converting to NumPy. The model bundle stores the same list. `predict._predict_class()` rejects a bundle whose stored list differs, and `feature_vector()` applies the same order while rejecting missing or non-finite values. Runtime schema testing returned a `(1, 41)` vector.

There is no feature-name mismatch. Extra extractor keys would be silently discarded, however; only missing names are reported.

## NDI mathematical audit

The implementation computes:

```text
quality = 0.25*local
        + 0.25*global
        + 0.20*story
        + 0.15*speech_rate_quality
        + 0.15*pause_quality
NDI = clip(100 - quality, 0, 100)
```

Weights total exactly 1.0. Coherence and story scores are clipped to 0–100. Speech-rate quality rises linearly from 0 to 100 WPM, stays at 100 through 160 WPM, then falls by 1.25 points per WPM to zero at 240 WPM. Pause quality falls linearly from 100 at 0 seconds to zero at 3 seconds. Risk intervals correctly implement `[0,20)`, `[20,40)`, `[40,60)`, and `[60,100]` for finite values.

The formula is internally correct but not robust to NaN/infinity and is not clinically calibrated. The coherence conversion `(cosine + 1) * 50` assigns an unrelated cosine of 0 a quality of 50; this is mathematically valid as a range transformation but is a consequential, undocumented baseline assumption rather than evidence of moderate coherence.

## File-by-file audit

### `src/__init__.py`

- Valid package marker and version constant.
- No execution issue or dead code.

### `src/config.py`

- All `Path` calculations resolve relative to `ndi_project`, independent of current working directory.
- Folder labels match the four requested output classes.
- Feature names are unique and consistent across all consumers.
- `CLASS_NAMES` and `MODEL_DIR` are both used; no dead configuration was found.

### `src/speech_to_text.py`

- Lazy import prevents module import from downloading/loading Whisper.
- `WhisperModel("base.en", device="cpu", compute_type="int8")` is a valid intended configuration.
- `transcribe()` arguments and generator consumption are correctly structured.
- File existence is checked and output whitespace is normalized.
- No audio-format validation, model-download error guidance, timeout, or fallback exists.
- A cache size of two can retain two large models simultaneously if callers vary configuration.

### `src/narrative_analysis.py`

- spaCy model loading and parser-based sentence segmentation are correct; disabling only NER leaves sentence boundaries available.
- SentenceTransformer embeddings are normalized, so dot products correctly represent cosine similarity.
- `all-mpnet-base-v2` has a 768-dimensional output, matching the empty-array shape.
- A one-sentence narrative receives an arbitrary local coherence of 50 rather than “not measurable.”
- Cosine remapping makes zero similarity equal 50, materially inflating the quality baseline.
- Lexical richness uses MATTR correctly for its chosen regex/window, but short texts receive simple TTR and are therefore not comparable to 50-token texts without calibration.
- Repetition uses raw trigrams including stopwords and ASR artifacts; the name `repetition_score` actually means “non-repetition quality,” which is easy to misinterpret.

### `src/story_grammar.py`

- Keyword and semantic paths are both called correctly.
- Embedding slicing and sentence-to-prototype matrix multiplication have compatible dimensions.
- Keyword checks are substring checks, not token/lemma checks: short terms such as `get` and `stand` can match unrelated words.
- Negation and event roles are ignored. “She does not notice” activates `resolution`; this describes absence of resolution but is scored as resolution present.
- A single generic keyword can award a component regardless of narrative context.
- The semantic threshold 0.42 is unvalidated and all six prototypes are compared to every sentence.

### `src/speech_biomarkers.py`

- Audio is loaded mono at 16 kHz, and duration/WPM arithmetic is structurally correct.
- Internal gaps are derived correctly from adjacent non-silent intervals and filtered at 250 ms.
- MFCC loop names exactly match configuration.
- pYIN bounds C2–C7 are below the 8 kHz Nyquist limit at 16 kHz.
- `effects.split` is amplitude thresholding, not speech VAD; background noise can be counted as speaking time and erase pauses.
- MFCCs and pitch are computed over the full recording, including silence/noise, despite voiced intervals already being available.
- Completely unvoiced pitch is converted to four zeros, conflating missing pitch with genuine 0 Hz and preventing the imputer from handling missingness.
- Very short/corrupt audio and decoder/pYIN failures are not wrapped with actionable errors.
- `pause_count` is returned as float for model consistency, although it is semantically an integer.

### `src/feature_extraction.py`

- Calls narrative, story, and acoustic extraction correctly.
- Enforces missing names, canonical order, numeric conversion, and finite vectors.
- Does not reject unexpected features before discarding them.
- `feature_vector()` is used by inference and is not dead code.

### `src/ndi_engine.py`

- Finite-input math and boundaries are correct.
- No finite-value/type validation occurs before NumPy clipping.
- NaN produces a NaN score and falls through every comparison to `High Risk`, a false categorical result.
- The hand-authored WPM/pause transforms and weights have no learned or validated calibration.

### `src/train_classifier.py`

- Discovery, transcription, numeric extraction, stratified split, imputation, Random Forest training, metrics, and persistence are connected correctly.
- The classifier sees only numeric extracted features, never raw transcript text.
- The test-size calculation ensures at least one test sample per class; the subsequent train-size guard ensures at least one training slot per class.
- A complete synthetic execution passed only after forcing the Agg backend.
- Matplotlib backend is not set before importing `pyplot`; default execution failed in the audited environment during confusion-matrix creation.
- The model is written before metrics and confusion-matrix generation. A late reporting failure therefore leaves a model artifact from a command that exited unsuccessfully.
- Outputs always go to global `OUTPUT_DIR`, even when callers supply a custom `data_dir` or `model_path`.
- Only lowercase `*.wav` is discovered; uppercase `.WAV` can be missed on case-sensitive systems.
- The split is sample-level, not participant-grouped, allowing serious leakage with repeated recordings.
- Per-file extraction errors abort the entire training run; there is no failure manifest or resumable feature cache.

### `src/predict.py`

- Orchestration order and model-schema guard are correct.
- Saved pipeline prediction and probability calls were exercised successfully.
- Missing model behavior is intentional and produces deterministic NDI output plus `Model not trained`.
- Story grammar is computed once inside `extract_features()` and then computed again for display. This repeats sentence segmentation and six-prototype embedding work on every prediction.
- `joblib.load()` is unsafe for untrusted model files; the project does not warn that the model artifact must be trusted.
- Model bundle fields/types are only partially validated; malformed bundles can raise unhelpful `KeyError`/attribute errors.

### `app/streamlit_app.py`

- Project-root insertion makes `src` importable when launched from another working directory.
- Uploaded bytes are closed before Faster-Whisper/Librosa read them, which is correct on Windows.
- Temporary audio is removed in `finally` after analysis.
- Every displayed key exists in `predict_patient()` output, and installed Streamlit 1.56 accepts the used widget/chart arguments.
- The app cannot currently import end-to-end in the audited environment because Librosa is absent.
- All analysis is synchronous, with no resource cache/progress granularity; first model downloads can look stalled.
- Broad exception handling displays only the exception text and records no traceback for operators.
- The temporary-file cleanup uses a `locals()` presence check; explicit initialization to `None` would be clearer and safer across rerun semantics.

### `tests/test_ndi_engine.py`

- Both existing tests are valid and call the public scorer correctly.
- Tests cover only two broad score outcomes, not exact math, all risk boundaries, clipping, missing fields, NaN/infinity, or speech-rate breakpoints.

### `tests/test_narrative_metrics.py`

- Existing lexical/repetition tests are valid and dependency-light.
- No tests cover spaCy segmentation, embedding shape, local/global coherence, story grammar, audio extraction, feature schema, training persistence, prediction orchestration, or Streamlit keys.

## Critical Issues

### C1. Training can abort during confusion-matrix generation

`train_classifier.py` imports `matplotlib.pyplot` without selecting a non-interactive backend. In the audited Windows environment, `ConfusionMatrixDisplay.from_predictions()` selected Tk and raised `_tkinter.TclError` because a usable Tcl/Tk installation was unavailable. This violates the requirement that the training pipeline execute without modification.

**Impact:** Training exits as failed after expensive extraction and fitting.  
**Required correction:** Call `matplotlib.use("Agg")` before importing `pyplot`, or construct figures with an explicitly headless backend.

### C2. A failed training command can leave a seemingly valid model

`joblib.dump()` occurs before CSV/JSON/confusion-matrix reporting. The confirmed plotting failure happened after model serialization.

**Impact:** Operators can unknowingly deploy a model produced by an unsuccessful run.  
**Required correction:** Generate all artifacts in a temporary run directory, then atomically move the complete artifact set into place only after every step succeeds.

## Major Issues

### M1. NaN NDI values are silently categorized as High Risk

NumPy clipping preserves NaN; every `<` comparison is false, so the final `else` assigns High Risk.

**Correction:** Convert inputs to floats, require `math.isfinite`, and raise a validation error before scoring.

### M2. Story-grammar scoring does not faithfully detect narrative components

Substring matching, missing negation handling, and the `resolution` prototype/keywords cause statements such as “the woman does not notice” to count as a resolution. The resulting 0–6 score can be systematically inflated.

**Correction:** Match token lemmas/phrases with boundaries, represent positive and negative evidence separately, and require event-role patterns or calibrated semantic entailment.

### M3. Prediction computes story grammar twice

`extract_features()` scores it, and `predict_patient()` immediately scores it again for component details.

**Impact:** Avoidable neural embedding latency and CPU/GPU work.  
**Correction:** Return structured feature metadata from one extraction pass or let `extract_features` accept/precompute story results.

### M4. Acoustic missingness is encoded as physiological zero

Unvoiced pYIN output becomes zero-valued pitch statistics. Zero Hz is not a valid measured pitch and differs from missing data.

**Correction:** Return NaN plus a `voiced_fraction` feature, allowing the imputer/model to distinguish missing pitch.

### M5. Full dependency/audio/model execution is unverified

The current machine lacks Faster-Whisper, SentenceTransformer, Librosa, SoundFile, pytest, and Ruff, and contains no WAV/model artifact. Static contracts are plausible but cannot substitute for a real install-and-audio integration test.

**Correction:** Build a locked clean environment, cache the two neural models, add a short consented WAV fixture, and run training/prediction/Streamlit smoke tests in CI.

### M6. Sample-level splitting risks participant leakage

Multiple recordings from one patient can enter both train and test sets, greatly inflating reported performance.

**Correction:** Require participant IDs and use `GroupShuffleSplit` or stratified group cross-validation.

## Minor Issues

- The shifted cosine scale assigns score 50 to cosine 0; document/calibrate it or use an empirically fitted mapping.
- Single-sentence local coherence is arbitrarily set to 50 rather than marked missing.
- `repetition_score` is semantically a non-repetition score; rename it to avoid sign confusion.
- WAV discovery ignores uppercase `.WAV` on case-sensitive filesystems.
- Custom model/data paths do not relocate output reports.
- `pyproject.toml` declares no runtime dependencies, so `pip install .` does not produce a runnable installation; only the documented requirements workflow does.
- The allowed dependency ranges are broad and no lock file records a tested environment.
- `get_embeddings([])` hard-codes 768 dimensions, coupling fallback behavior to one model.
- Background noise can invalidate amplitude-based speaking/pause intervals.
- MFCCs include silence and recording-channel effects without normalization or quality controls.
- Model-bundle metadata is stored but not fully validated during load.
- No checksums/model provenance are stored for Whisper, SentenceTransformer, spaCy, or the trained classifier.
- The 40 supplied transcripts are not present as a versioned artifact, despite documentation describing them as qualitative fixtures.
- Streamlit catches exceptions without server-side structured logging.
- Test coverage is too small for the number of numerical boundaries and external integrations.

## Placeholder, TODO, and dead-code review

- **Placeholders:** None found in executable code.
- **TODO/FIXME markers:** None found.
- **Empty/pass implementations:** None found.
- **Dead functions:** None found; private helpers and both CLI `main()` functions are reachable.
- **Unused model metadata:** `classes`, `metrics`, and `version` are not read by inference, but retaining them for auditability is reasonable.
- **Intentional empty artifact directories:** They contain explanatory README files and are not code placeholders. The absent `rf_model.pkl` is expected until real WAV training data is provided.

## Path and artifact audit

All configured base paths resolve correctly from `src/config.py` to the project root:

- `data/` exists with `healthy/`, `mci/`, `moderate/`, and `severe/` directories on disk, but no WAV files.
- `models/` exists, but `rf_model.pkl` does not.
- `outputs/`, `audio/`, and `transcripts/` exist and contain documentation only.
- Streamlit temporary audio uses the operating-system temp directory and is deleted after analysis.
- CLI output creates its parent directory before writing.
- Training creates model/output parent directories before writing.

No invalid hard-coded absolute path was found. The only path-behavior defects are case-sensitive WAV discovery and global report output despite custom training paths.

## Suggested Improvements

Recommended order:

1. Make training atomic and force the Agg plotting backend.
2. Reject non-finite values before NDI scoring and add exact boundary tests.
3. Refactor feature extraction to return both numeric features and story-component metadata in one pass.
4. Redesign story grammar around token boundaries, negation, event roles, and validated thresholds.
5. Represent unvoiced pitch as missing, add voiced fraction, and calculate MFCC/pitch on quality-controlled voiced regions.
6. Introduce participant IDs and group-aware evaluation; report macro as well as weighted metrics and confidence intervals.
7. Add unit tests with mocked neural encoders plus a small real WAV integration fixture.
8. Add CI for Python 3.10–3.12, a dependency lock file, offline model-cache configuration, and a Streamlit startup smoke test.
9. Add structured logging, per-file extraction failure reports, feature caching, and atomic artifact manifests containing hashes and model versions.
10. Version the supplied transcript corpus as a clearly marked qualitative-only JSONL/CSV artifact without using it to synthesize acoustic training rows.

## Final disposition

**Status: Requires correction before production or research evaluation.** The architecture and schema are sound enough to continue development, but the two critical training-artifact issues and the major scoring/data-quality issues prevent a production-quality rating. No clinical interpretation should be attached to current NDI values or classifier outputs.
