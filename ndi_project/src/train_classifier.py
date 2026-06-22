"""Train a Random Forest exclusively on extracted audio/narrative features."""

from __future__ import annotations

import argparse
import json
import logging
import math
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

from .config import (
    DATA_DIR,
    FEATURE_NAMES,
    FOLDER_TO_CLASS,
    MODEL_PATH,
    OUTPUT_DIR,
    PROJECT_ROOT,
)
from .feature_extraction import extract_features
from .speech_to_text import transcribe_audio

LOGGER = logging.getLogger(__name__)


def discover_audio(data_dir: Path) -> list[tuple[Path, str]]:
    """Discover WAV files from the four required class directories."""
    samples: list[tuple[Path, str]] = []
    for folder, label in FOLDER_TO_CLASS.items():
        class_dir = data_dir / folder
        samples.extend(
            (path, label)
            for path in sorted(class_dir.rglob("*"))
            if path.is_file() and path.suffix.lower() == ".wav"
        )
    return samples


def _publish_artifacts_atomically(staged_to_target: dict[Path, Path]) -> None:
    """Publish a complete artifact set, restoring prior files on any failure."""
    missing = [str(path) for path in staged_to_target if not path.is_file()]
    if missing:
        raise RuntimeError(f"Training artifacts were not completed: {missing}")

    first_staged = next(iter(staged_to_target))
    backup_dir = first_staged.parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=False)
    backups: dict[Path, Path] = {}
    published: list[Path] = []
    try:
        for index, (staged, target) in enumerate(staged_to_target.items()):
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                backup = backup_dir / f"{index}_{target.name}"
                os.replace(target, backup)
                backups[target] = backup
            os.replace(staged, target)
            published.append(target)
    except Exception:
        for target in reversed(published):
            if target.exists():
                target.unlink()
        for target, backup in backups.items():
            if backup.exists():
                os.replace(backup, target)
        raise


def build_feature_table(data_dir: Path = DATA_DIR) -> pd.DataFrame:
    """Transcribe each labeled WAV and extract model-ready numeric features."""
    samples = discover_audio(data_dir)
    if not samples:
        raise RuntimeError(
            f"No labeled WAV files found under {data_dir}. Training was intentionally "
            "skipped: add real audio to healthy/, mci/, moderate/, and severe/."
        )
    rows: list[dict[str, object]] = []
    for index, (audio_path, label) in enumerate(samples, start=1):
        LOGGER.info("Processing %d/%d: %s", index, len(samples), audio_path)
        transcript = transcribe_audio(audio_path)
        if not transcript:
            LOGGER.warning("Skipping audio with empty transcript: %s", audio_path)
            continue
        rows.append(
            {
                "audio_path": str(audio_path.resolve()),
                "label": label,
                "transcript": transcript,
                **extract_features(audio_path, transcript),
            }
        )
    if not rows:
        raise RuntimeError("No usable samples remained after transcription.")
    return pd.DataFrame(rows)


def train_classifier(
    data_dir: Path = DATA_DIR,
    model_path: Path = MODEL_PATH,
    random_state: int = 42,
) -> dict[str, object]:
    """Extract data, perform a stratified 80/20 split, evaluate, and persist model."""
    table = build_feature_table(data_dir)
    class_counts = table["label"].value_counts()
    missing_classes = set(FOLDER_TO_CLASS.values()) - set(class_counts.index)
    if missing_classes or (class_counts < 2).any():
        raise RuntimeError(
            "Stratified training needs at least 2 real WAV files per class. "
            f"Counts: {class_counts.to_dict()}; missing: {sorted(missing_classes)}"
        )

    # Train on a positional numeric matrix; the exact order is persisted in the
    # model bundle and enforced by feature_vector() during inference.
    X = table[FEATURE_NAMES].to_numpy(dtype="float64")
    y = table["label"]
    class_count = y.nunique()
    test_count = max(class_count, math.ceil(len(table) * 0.20))
    if len(table) - test_count < class_count:
        raise RuntimeError("Not enough WAV files for every class in both train and test sets.")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_count,
        random_state=random_state,
        stratify=y,
    )
    pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=500,
                    class_weight="balanced_subsample",
                    random_state=random_state,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, predictions, average="weighted", zero_division=0
    )
    metrics: dict[str, object] = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "precision_weighted": round(float(precision), 4),
        "recall_weighted": round(float(recall), 4),
        "f1_weighted": round(float(f1), 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_counts": class_counts.to_dict(),
        "per_class": classification_report(
            y_test, predictions, output_dict=True, zero_division=0
        ),
    }

    bundle = {
        "model": pipeline,
        "feature_names": FEATURE_NAMES,
        "classes": list(pipeline.classes_),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metrics": metrics,
        "version": "1.0.0",
    }
    # Build the entire artifact set in a same-filesystem staging directory. No
    # published file is touched until fitting and every report have succeeded.
    with tempfile.TemporaryDirectory(prefix="ndi-training-", dir=PROJECT_ROOT) as temp_dir:
        staging = Path(temp_dir)
        staged_model = staging / "rf_model.pkl"
        staged_features = staging / "extracted_features.csv"
        staged_metrics = staging / "training_metrics.json"
        staged_confusion = staging / "confusion_matrix.png"

        joblib.dump(bundle, staged_model)
        table.to_csv(staged_features, index=False)
        staged_metrics.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        display = ConfusionMatrixDisplay.from_predictions(
            y_test, predictions, labels=list(pipeline.classes_), xticks_rotation=25, cmap="Blues"
        )
        try:
            display.figure_.set_size_inches(9, 7)
            display.figure_.tight_layout()
            display.figure_.savefig(staged_confusion, dpi=160)
        finally:
            plt.close(display.figure_)

        # Publish the model last. If any replacement fails, prior artifacts are
        # restored and no artifact from this run remains visible.
        _publish_artifacts_atomically(
            {
                staged_features: OUTPUT_DIR / "extracted_features.csv",
                staged_metrics: OUTPUT_DIR / "training_metrics.json",
                staged_confusion: OUTPUT_DIR / "confusion_matrix.png",
                staged_model: model_path,
            }
        )
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR)
    parser.add_argument("--model-path", type=Path, default=MODEL_PATH)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    try:
        metrics = train_classifier(args.data_dir, args.model_path)
    except RuntimeError as exc:
        raise SystemExit(str(exc)) from exc
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
