from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple


@dataclass
class MetricResult:
    field: str
    code: str
    label: str
    value: float
    interpretation: str


DEFAULT_METRICS: List[Tuple[str, str, str]] = [
    ("score_water", "BV1", "Accès à l'eau"),
    ("score_food", "BV2", "Alimentation"),
    ("score_housing", "BV3", "Logement"),
    ("score_healthcare", "BV4", "Santé"),
    ("score_security", "BV5", "Sécurité"),
    ("score_education", "BE1", "Éducation"),
    ("score_social_cohesion", "BE2", "Cohésion sociale"),
    ("score_nature", "BE3", "Relation à la nature"),
    ("score_local_economy", "BI1", "Économie locale"),
    ("score_energy", "BI2", "Énergie"),
    ("score_mobility", "BI3", "Mobilité"),
]


def _interpret(score: float) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Bon"
    if score >= 40:
        return "Moyen"
    if score >= 20:
        return "Faible"
    return "Critique"


def compute_flash_metrics(
    baseline_scores: Dict[str, float], overrides: Dict[str, float]
) -> Iterable[MetricResult]:
    for field, code, label in DEFAULT_METRICS:
        base_value = baseline_scores.get(field, 0)
        value = overrides.get(field, base_value)
        yield MetricResult(
            field=field,
            code=code,
            label=label,
            value=value,
            interpretation=_interpret(value),
        )
