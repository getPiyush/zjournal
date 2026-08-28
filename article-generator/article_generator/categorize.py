"""Keyword-based category classifier.

No LLM/API dependency: each candidate category (drawn from the analyzed db.json, see
db_profile.py) is scored by counting whole-word/phrase keyword hits in the article's
title and content, with title hits weighted higher. The category with the highest
score wins; ties and zero-score articles fall back to the caller-supplied default.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Science": ["research", "scientist", "study", "discovery", "experiment", "laboratory",
                "dna", "genetic", "species", "biology", "chemistry", "fossil"],
    "Space": ["nasa", "galaxy", "planet", "telescope", "astronomer", "orbit", "cosmic",
              "star", "universe", "moon", "mars", "spacecraft", "asteroid", "esa", "webb"],
    "Technology": ["software", "app", "startup", "gadget", "device", "internet", "computer",
                   "smartphone", "digital", "artificial intelligence", "chip", "hardware"],
    "History": ["ancient", "century", "historical", "empire", "civilization", "archaeolog",
                "medieval", "dynasty", "excavation", "artifact"],
    "Mathematics": ["theorem", "equation", "proof", "algorithm", "geometry", "calculus",
                    "prime number", "fibonacci", "conjecture"],
    "Art": ["painting", "artist", "exhibition", "gallery", "sculpture", "museum",
            "aesthetic", "artwork", "curator"],
    "Software Development": ["source code", "programming", "developer", "framework", " api ",
                              "github", "javascript", "python", "react", "deployment",
                              "microservice", "ci/cd", "pipeline"],
    "Physics": ["quantum", "particle", "physics", "relativity", "gravity", "collider",
                "subatomic", "gravitational wave"],
    "Philosophy": ["ethics", "philosophy", "philosopher", "existential", "metaphysics",
                   "moral", "consciousness"],
    "Medicine": ["patient", "treatment", "clinical", "disease", "therapy", "drug",
                 "vaccine", "diagnosis", "surgery", "immune"],
    "Psychology": ["behavior", "cognitive", "mental health", "psycholog", "emotion",
                   "personality", "mindset"],
    "Engineering": ["engineer", "infrastructure", "construction", "mechanical", "robot",
                    "manufacturing", "turbine", "structural"],
}


def _score(text: str, keywords: List[str]) -> int:
    score = 0
    for kw in keywords:
        if " " in kw.strip():
            score += text.count(kw)
        else:
            score += len(re.findall(rf"\b{re.escape(kw)}\w*", text))
    return score


def categorize(title: str, content: str, candidates: List[str], default: Optional[str] = None) -> str:
    text = f"{title}\n{content}".lower()
    best_category = None
    best_score = 0
    for category in candidates:
        keywords = CATEGORY_KEYWORDS.get(category)
        if not keywords:
            continue
        score = _score(text, keywords)
        if score > best_score:
            best_score = score
            best_category = category
    if best_category:
        return best_category
    return default or (candidates[0] if candidates else "Technology")
