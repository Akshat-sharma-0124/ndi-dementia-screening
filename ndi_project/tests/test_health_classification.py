"""Unit tests for health score classification logic."""

import pytest

from src.predict import _classify_health


class TestClassifyHealth:
    """Test suite for _classify_health boundary conditions."""

    def test_healthy_threshold_lower_bound(self) -> None:
        """Test that 61.0 is classified as Healthy (inclusive lower bound)."""
        assert _classify_health(61.0) == "Healthy"

    def test_healthy_above_threshold(self) -> None:
        """Test that scores above 61 are classified as Healthy."""
        assert _classify_health(75.0) == "Healthy"
        assert _classify_health(100.0) == "Healthy"

    def test_healthy_just_below_threshold_is_mci(self) -> None:
        """Test that 60.99 is classified as MCI, not Healthy."""
        assert _classify_health(60.99) == "MCI"

    def test_mci_threshold_lower_bound(self) -> None:
        """Test that 50.0 is classified as MCI (inclusive lower bound)."""
        assert _classify_health(50.0) == "MCI"

    def test_mci_in_range(self) -> None:
        """Test that scores between 50 and 60 are classified as MCI."""
        assert _classify_health(55.0) == "MCI"
        assert _classify_health(50.5) == "MCI"

    def test_mci_just_below_threshold_is_moderate(self) -> None:
        """Test that 49.99 is classified as Moderate, not MCI."""
        assert _classify_health(49.99) == "Moderate"

    def test_moderate_threshold_lower_bound(self) -> None:
        """Test that 35.0 is classified as Moderate (inclusive lower bound)."""
        assert _classify_health(35.0) == "Moderate"

    def test_moderate_in_range(self) -> None:
        """Test that scores between 35 and 49 are classified as Moderate."""
        assert _classify_health(40.0) == "Moderate"
        assert _classify_health(35.5) == "Moderate"

    def test_moderate_just_below_threshold_is_severe(self) -> None:
        """Test that 34.99 is classified as Severe, not Moderate."""
        assert _classify_health(34.99) == "Severe"

    def test_severe_threshold_lower_bound(self) -> None:
        """Test that 0.0 is classified as Severe."""
        assert _classify_health(0.0) == "Severe"

    def test_severe_in_range(self) -> None:
        """Test that scores below 35 are classified as Severe."""
        assert _classify_health(20.0) == "Severe"
        assert _classify_health(34.5) == "Severe"

    @pytest.mark.parametrize(
        ("score", "expected_classification"),
        [
            (0.0, "Severe"),
            (10.0, "Severe"),
            (34.99, "Severe"),
            (35.0, "Moderate"),
            (40.0, "Moderate"),
            (49.99, "Moderate"),
            (50.0, "MCI"),
            (55.0, "MCI"),
            (60.99, "MCI"),
            (61.0, "Healthy"),
            (75.0, "Healthy"),
            (100.0, "Healthy"),
        ],
    )
    def test_classification_parametrized(
        self, score: float, expected_classification: str
    ) -> None:
        """Parametrized test of all classification boundaries."""
        assert _classify_health(score) == expected_classification

    def test_classification_matches_frontend_health_score_definition(self) -> None:
        """
        Verify the classification matches the frontend's Health Score scale:
        61-100 = Healthy
        50-60 = MCI
        35-49 = Moderate
        0-34 = Severe
        """
        assert _classify_health(61) == "Healthy"
        assert _classify_health(100) == "Healthy"
        assert _classify_health(50) == "MCI"
        assert _classify_health(60) == "MCI"
        assert _classify_health(35) == "Moderate"
        assert _classify_health(49) == "Moderate"
        assert _classify_health(0) == "Severe"
        assert _classify_health(34) == "Severe"
