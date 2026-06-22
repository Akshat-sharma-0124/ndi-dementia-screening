from src.narrative_analysis import calculate_lexical_richness, calculate_repetition_score


def test_empty_text_metrics() -> None:
    assert calculate_lexical_richness("") == 0.0
    assert calculate_repetition_score("") == 0.0


def test_repetition_penalizes_duplicate_trigrams() -> None:
    repeated = "the boy falls the boy falls the boy falls"
    varied = "the boy reaches while water spills across the kitchen floor"
    assert calculate_repetition_score(repeated) < calculate_repetition_score(varied)

