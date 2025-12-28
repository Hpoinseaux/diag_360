from typing import List

from sqlalchemy.orm import Session

from app.calculations import compute_flash_metrics
from app.models.territory import Territory
from app.schemas.report import FlashMetric, FlashReportRequest, FlashReportResponse


def _interpret_score(value: float) -> str:
    if value >= 80:
        return "Excellent"
    if value >= 60:
        return "Bon"
    if value >= 40:
        return "Moyen"
    if value >= 20:
        return "Faible"
    return "Critique"


SCORE_FIELDS = [
    ("BV1", "Accès à l'eau", "score_water"),
    ("BV2", "Alimentation", "score_food"),
    ("BV3", "Logement", "score_housing"),
    ("BV4", "Santé", "score_healthcare"),
    ("BV5", "Sécurité", "score_security"),
    ("BE1", "Éducation", "score_education"),
    ("BE2", "Cohésion sociale", "score_social_cohesion"),
    ("BE3", "Nature", "score_nature"),
    ("BI1", "Économie locale", "score_local_economy"),
    ("BI2", "Énergie", "score_energy"),
    ("BI3", "Mobilité", "score_mobility"),
]


def generate_flash_report(db: Session, payload: FlashReportRequest) -> FlashReportResponse:
    territory = (
        db.query(Territory)
        .filter(Territory.code_siren == payload.code_siren)
        .first()
    )
    if not territory:
        raise ValueError("Territory not found")

    baseline = float(territory.score or 0)

    baseline_map = {
        field: float(getattr(territory, field) or baseline)
        for _, _, field in SCORE_FIELDS
    }

    metrics_results = list(
        compute_flash_metrics(baseline_map, payload.scores)
    )

    metrics: List[FlashMetric] = [
        FlashMetric(
            code=result.code,
            name=result.label,
            value=result.value,
            interpretation=result.interpretation,
        )
        for result in metrics_results
    ]

    adjusted_score = (
        sum(metric.value for metric in metrics) / len(metrics) if metrics else baseline
    )

    summary = (
        f"Score moyen ajusté: {adjusted_score:.1f}. "
        "Les données saisies ne sont pas stockées et servent uniquement à générer ce rapport temporaire."
    )

    return FlashReportResponse(
        territory_name=territory.name,
        code_siren=territory.code_siren,
        baseline_score=baseline,
        adjusted_score=adjusted_score,
        metrics=metrics,
        summary=summary,
    )
