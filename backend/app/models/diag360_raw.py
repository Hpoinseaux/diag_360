from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY

from app.db import Base


class Epci(Base):
    __tablename__ = "epcis"
    __table_args__ = {"schema": "diag360_raw"}

    code_siren = Column(String, primary_key=True)
    department_code = Column(String)
    label = Column(Text, nullable=False)
    legal_form = Column(Text)
    population_communal = Column(Numeric)
    population_total = Column(Numeric)
    area_hectares = Column(Numeric)
    area_km2 = Column(Numeric)
    urbanised_area_km2 = Column(Numeric)
    density_per_km2 = Column(Numeric)
    department_count = Column(Numeric)
    region_count = Column(Numeric)
    member_count = Column(Numeric)
    delegate_count = Column(Numeric)
    competence_count = Column(Numeric)
    fiscal_potential = Column(Numeric)
    grant_global = Column(Numeric)
    grant_compensation = Column(Numeric)
    grant_intercommunality = Column(Numeric)
    seat_city = Column(Text)
    source_row = Column(Numeric)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class IndicatorValue(Base):
    __tablename__ = "indicator_values"
    __table_args__ = {"schema": "diag360_raw"}

    epci_siren = Column(String, ForeignKey("diag360_raw.epcis.code_siren", ondelete="CASCADE"), primary_key=True)
    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    data_year = Column(String, primary_key=True, default="0")
    value = Column(Numeric)
    unit = Column(Text)
    source_sheet = Column(Text, default="Table Valeurs")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class IndicatorScore(Base):
    __tablename__ = "indicator_scores"
    __table_args__ = {"schema": "diag360_raw"}

    epci_siren = Column(String, ForeignKey("diag360_raw.epcis.code_siren", ondelete="CASCADE"), primary_key=True)
    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    data_year = Column(String, primary_key=True, default="0")
    score = Column(Numeric(5, 2))
    source_sheet = Column(Text, default="Table Scores indicateurs")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ScoreMean(Base):
    __tablename__ = "score_means"
    __table_args__ = {"schema": "diag360_raw"}

    epci_siren = Column(String, ForeignKey("diag360_raw.epcis.code_siren", ondelete="CASCADE"), primary_key=True)
    metric_code = Column(String, primary_key=True)
    data_year = Column(String, primary_key=True, default="0")
    value = Column(Numeric(5, 2))
    source_sheet = Column(Text, default="Table Scores moyens")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class NeedScore(Base):
    __tablename__ = "need_scores"
    __table_args__ = {"schema": "diag360_raw"}

    epci_siren = Column(String, ForeignKey("diag360_raw.epcis.code_siren", ondelete="CASCADE"), primary_key=True)
    need_id = Column(String, ForeignKey("diag360_ref.needs.id", ondelete="CASCADE"), primary_key=True)
    data_year = Column(String, primary_key=True, default="0")
    need_label = Column(Text)
    need_score = Column(Numeric(5, 2))
    indicators_count = Column(Integer)
    computed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class TransformationRule(Base):
    __tablename__ = "transformation_rules"
    __table_args__ = {"schema": "diag360_raw"}

    indicator_id = Column(String, ForeignKey("diag360_ref.indicators.id", ondelete="CASCADE"), primary_key=True)
    value_type = Column(Text, primary_key=True)
    unit = Column(Text)
    min_value = Column(Numeric)
    max_value = Column(Numeric)
    bound_type = Column(Text)
    regression_type = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
