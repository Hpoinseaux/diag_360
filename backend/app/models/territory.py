import uuid

from sqlalchemy import Column, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.db import Base


class Territory(Base):
    __tablename__ = "territories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code_siren = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    population = Column(Integer, nullable=True)
    department = Column(String, nullable=True)
    region = Column(String, nullable=True)
    score = Column(Numeric(5, 2), nullable=False, default=0)
    score_water = Column(Numeric(5, 2))
    score_food = Column(Numeric(5, 2))
    score_housing = Column(Numeric(5, 2))
    score_healthcare = Column(Numeric(5, 2))
    score_security = Column(Numeric(5, 2))
    score_education = Column(Numeric(5, 2))
    score_social_cohesion = Column(Numeric(5, 2))
    score_nature = Column(Numeric(5, 2))
    score_local_economy = Column(Numeric(5, 2))
    score_energy = Column(Numeric(5, 2))
    score_mobility = Column(Numeric(5, 2))
    data_year = Column(Integer, nullable=True)
