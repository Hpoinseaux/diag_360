from typing import List, Optional

from pydantic import BaseModel, Field


class FlashMetric(BaseModel):
    code: str
    name: str
    value: float
    interpretation: str


class FlashReportRequest(BaseModel):
    code_siren: str
    scores: dict[str, float] = Field(
        default_factory=dict,
        description="Dict containing optional overrides for each score_* metric",
    )
    comments: Optional[str] = None


class FlashReportResponse(BaseModel):
    territory_name: str
    code_siren: str
    baseline_score: float
    adjusted_score: float
    metrics: List[FlashMetric]
    summary: str
