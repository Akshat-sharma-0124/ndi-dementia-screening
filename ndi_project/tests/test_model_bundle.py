import numpy as np
import pytest

from src.config import FEATURE_NAMES
from src.predict import _validate_model_bundle


class FakeModel:
    classes_ = np.asarray(["Healthy", "Severe Dementia"])

    def predict(self, values: np.ndarray) -> np.ndarray:
        return np.asarray(["Healthy"])

    def predict_proba(self, values: np.ndarray) -> np.ndarray:
        return np.asarray([[0.75, 0.25]])


def valid_bundle() -> dict[str, object]:
    return {
        "feature_names": FEATURE_NAMES,
        "model": FakeModel(),
        "classes": ["Healthy", "Severe Dementia"],
        "metrics": {"accuracy": 1.0},
        "version": "1.0.0",
    }


def test_valid_model_bundle() -> None:
    bundle = valid_bundle()
    assert _validate_model_bundle(bundle) is bundle


@pytest.mark.parametrize("missing", ["feature_names", "model", "classes", "metrics", "version"])
def test_model_bundle_rejects_missing_required_fields(missing: str) -> None:
    bundle = valid_bundle()
    del bundle[missing]
    with pytest.raises(RuntimeError, match="missing fields"):
        _validate_model_bundle(bundle)


def test_model_bundle_rejects_schema_mismatch() -> None:
    bundle = valid_bundle()
    bundle["feature_names"] = FEATURE_NAMES[:-1]
    with pytest.raises(RuntimeError, match="feature schema"):
        _validate_model_bundle(bundle)


def test_model_bundle_rejects_class_mismatch() -> None:
    bundle = valid_bundle()
    bundle["classes"] = ["Healthy"]
    with pytest.raises(RuntimeError, match="classes do not match"):
        _validate_model_bundle(bundle)


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("model", object(), "prediction methods"),
        ("classes", [], "classes must"),
        ("metrics", [], "metrics must"),
        ("version", "", "version must"),
    ],
)
def test_model_bundle_rejects_invalid_field(field: str, value: object, message: str) -> None:
    bundle = valid_bundle()
    bundle[field] = value
    with pytest.raises(RuntimeError, match=message):
        _validate_model_bundle(bundle)
