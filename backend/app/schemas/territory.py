from typing import List, Optional

from pydantic import BaseModel


class TerritoryBase(BaseModel):
    id: str
    code_siren: str
    name: str
    type: Optional[str] = None
    population: Optional[int] = None
    department: Optional[str] = None
    region: Optional[str] = None
    score: float
    score_water: Optional[float] = None
    score_food: Optional[float] = None
    score_housing: Optional[float] = None
    score_healthcare: Optional[float] = None
    score_security: Optional[float] = None
    score_education: Optional[float] = None
    score_social_cohesion: Optional[float] = None
    score_nature: Optional[float] = None
    score_local_economy: Optional[float] = None
    score_energy: Optional[float] = None
    score_mobility: Optional[float] = None
    data_year: Optional[int] = None

    model_config = {"from_attributes": True}


class TerritoryDetail(TerritoryBase):
    pass


class TerritoryListResponse(BaseModel):
    items: List[TerritoryBase]
    total: int

    model_config = {"from_attributes": True}
