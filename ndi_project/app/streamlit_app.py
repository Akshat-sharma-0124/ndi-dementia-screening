"""Streamlit interface for the NDI academic prototype."""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path

import pandas as pd
import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.predict import predict_patient  # noqa: E402

st.set_page_config(page_title="Narrative Degradation Index", page_icon="🧠", layout="wide")
st.title("Narrative Degradation Index (NDI)")
st.caption("Cookie Theft picture-description analysis · Academic prototype only")
st.warning("This demonstration is not validated for diagnosis or clinical decision-making.")

uploaded = st.file_uploader("Upload a patient WAV recording", type=["wav"])
if uploaded:
    st.audio(uploaded.getvalue(), format="audio/wav")
    if st.button("Analyze recording", type="primary", use_container_width=True):
        progress = st.progress(5, text="Preparing audio…")
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temporary:
                temporary.write(uploaded.getbuffer())
                temporary_path = Path(temporary.name)
            progress.progress(20, text="Transcribing and extracting features…")
            result = predict_patient(temporary_path)
            progress.progress(100, text="Analysis complete")

            st.subheader("Transcript")
            st.write(result["transcript"])
            col1, col2, col3, col4 = st.columns(4)
            col1.metric("NDI score", f'{result["ndi_score"]:.1f} / 100')
            col2.metric("Risk level", result["risk_level"])
            col3.metric("Predicted class", result["predicted_class"])
            col4.metric("Story grammar", f'{result["story_grammar_raw_score"]} / 6')
            st.progress(int(result["ndi_score"]), text="Higher NDI indicates greater degradation")

            st.subheader("Narrative profile")
            narrative_chart = pd.DataFrame(
                {
                    "score": {
                        "Local coherence": result["local_coherence"],
                        "Global coherence": result["global_coherence"],
                        "Story grammar": result["story_grammar_score"],
                        "Lexical richness": result["lexical_richness"],
                        "Non-repetition": result["repetition_score"],
                    }
                }
            )
            st.bar_chart(narrative_chart, y="score", horizontal=True)

            left, right = st.columns(2)
            with left:
                st.subheader("Story components")
                st.dataframe(
                    pd.DataFrame.from_dict(
                        result["story_grammar_components"], orient="index", columns=["Detected"]
                    ),
                    use_container_width=True,
                )
            with right:
                st.subheader("Speech biomarkers")
                display_keys = [
                    "speech_rate", "pause_count", "avg_pause_duration", "longest_pause",
                    "speaking_time", "silence_ratio", "pitch_mean", "pitch_std",
                ]
                biomarkers = result["speech_biomarkers"]
                st.dataframe(
                    pd.DataFrame(
                        {"Value": [biomarkers[key] for key in display_keys]}, index=display_keys
                    ),
                    use_container_width=True,
                )
            if result["class_probabilities"]:
                st.subheader("Classifier probabilities")
                st.bar_chart(
                    pd.DataFrame.from_dict(
                        result["class_probabilities"], orient="index", columns=["Probability"]
                    )
                )
            else:
                st.info("Classifier unavailable until real labeled WAV files are used for training.")
            with st.expander("Complete JSON result"):
                st.json(result)
        except Exception as exc:
            st.error(f"Analysis failed: {exc}")
        finally:
            if "temporary_path" in locals():
                temporary_path.unlink(missing_ok=True)

