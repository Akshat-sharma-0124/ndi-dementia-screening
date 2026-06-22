"""Rule-based and semantic Cookie Theft story-grammar detection."""

from __future__ import annotations

from typing import Iterable

import numpy as np

from .narrative_analysis import get_embeddings, split_into_sentences

COMPONENTS: dict[str, dict[str, object]] = {
    "setting": {
        "keywords": ("kitchen", "sink", "window", "floor", "cabinet"),
        "prototype": "The scene takes place in a kitchen by a sink and window.",
    },
    "characters": {
        "keywords": ("woman", "mother", "lady", "boy", "girl", "children", "kids"),
        "prototype": "A woman, a boy, and a girl are the people in the scene.",
    },
    "goal": {
        "keywords": ("want", "trying", "reach", "cookie", "jar", "get"),
        "prototype": "The children want to get cookies from the cookie jar.",
    },
    "attempt": {
        "keywords": ("climb", "stool", "stand", "reaching", "steal", "grab"),
        "prototype": "The boy climbs onto a stool and reaches for the cookie jar.",
    },
    "outcome": {
        "keywords": ("overflow", "spill", "tipping", "tilting", "fall", "wet", "flood"),
        "prototype": "The sink overflows and the unstable stool is about to fall.",
    },
    "resolution": {
        "keywords": ("notice", "warn", "catch", "help", "stop", "safe", "unaware"),
        "prototype": "The woman does not notice the danger or resolve the problems.",
    },
}


def _contains_keyword(text: str, keywords: Iterable[str]) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)


def detect_story_grammar(text: str, semantic_threshold: float = 0.42) -> dict[str, bool]:
    """Detect six narrative components through keywords plus sentence semantics."""
    if not text.strip():
        return {name: False for name in COMPONENTS}
    sentences = split_into_sentences(text)
    prototypes = [str(component["prototype"]) for component in COMPONENTS.values()]
    embeddings = get_embeddings([*sentences, *prototypes])
    sentence_embeddings = embeddings[: len(sentences)]
    prototype_embeddings = embeddings[len(sentences) :]

    detected: dict[str, bool] = {}
    for index, (name, component) in enumerate(COMPONENTS.items()):
        keyword_match = _contains_keyword(text, component["keywords"])  # type: ignore[arg-type]
        semantic_match = bool(
            len(sentence_embeddings)
            and np.max(sentence_embeddings @ prototype_embeddings[index]) >= semantic_threshold
        )
        detected[name] = keyword_match or semantic_match
    return detected


def score_story_grammar(text: str) -> dict[str, object]:
    """Return component flags, raw 0-6 score, and normalized 0-100 score."""
    components = detect_story_grammar(text)
    raw_score = sum(components.values())
    return {
        "components": components,
        "raw_score": raw_score,
        "normalized_score": round(raw_score / len(COMPONENTS) * 100.0, 2),
    }

